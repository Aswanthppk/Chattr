import React, { useEffect, useRef, useState } from 'react';
import { UserMatch } from '../types';
import { socketService } from '../services/SocketService';

interface VideoChatOverlayProps {
  match: UserMatch;
  onClose: () => void;
  onSkip: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export const VideoChatOverlay: React.FC<VideoChatOverlayProps> = ({
  match,
  onClose,
  onSkip
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [remoteMediaState, setRemoteMediaState] = useState({ videoEnabled: true, audioEnabled: true });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  // Initialize Media & WebRTC PeerConnection
  useEffect(() => {
    let isMounted = true;

    const setupMediaAndWebRTC = async () => {
      try {
        // Request Camera & Microphone permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // If partner is an AI companion, simulate AI video stream without WebRTC signaling
        if (match.isAi) {
          setConnectionState('connected');
          return;
        }

        // Setup RTCPeerConnection for real human partner
        const peer = new RTCPeerConnection(ICE_SERVERS);
        peerRef.current = peer;

        // Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        // Handle incoming remote tracks
        peer.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setConnectionState('connected');
          }
        };

        // Send local ICE candidates to remote partner via socket signaling
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.sendWebRtcSignal({ candidate: event.candidate });
          }
        };

        peer.onconnectionstatechange = () => {
          if (peer.connectionState === 'connected') {
            setConnectionState('connected');
          } else if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
            setConnectionState('failed');
          }
        };

        // Listen for incoming WebRTC signals from partner
        const unsubSignal = socketService.onWebRtcSignal(async (signal) => {
          if (!peerRef.current) return;

          try {
            if (signal.sdp) {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              if (signal.sdp.type === 'offer') {
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                socketService.sendWebRtcSignal({ sdp: peerRef.current.localDescription });
              }
            } else if (signal.candidate) {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } catch (err) {
            console.error('[WebRTC Signaling Error]', err);
          }
        });

        // Listen for partner audio/video mute state changes
        const unsubState = socketService.onWebRtcState((state) => {
          setRemoteMediaState(state);
        });

        // Initiate offer
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketService.sendWebRtcSignal({ sdp: peer.localDescription });

        return () => {
          unsubSignal();
          unsubState();
        };
      } catch (err: any) {
        console.error('[Camera Access Error]', err);
        if (isMounted) {
          setPermissionError(
            err.name === 'NotAllowedError'
              ? 'Camera/Microphone access was denied. Please allow permissions in your browser.'
              : 'Could not access camera or microphone device.'
          );
        }
      }
    };

    setupMediaAndWebRTC();

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, [match.id]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
        socketService.sendWebRtcState(!isMicOn, isCameraOn);
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
        socketService.sendWebRtcState(isMicOn, !isCameraOn);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0b12] text-white flex flex-col items-center justify-between p-3 sm:p-6 select-none font-sans overflow-hidden">
      {/* Dynamic Background Ambient Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#756cf6]/15 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#5146d0]/15 blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Glass Top Header Bar */}
      <div className="w-full max-w-5xl bg-[#121320]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 sm:px-5 flex items-center justify-between z-20 shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={match.avatarUrl || '/icons/chattr-icon-96x96.png'}
              alt={match.name}
              className="w-10 h-10 rounded-full border border-white/20 object-cover shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-state-success ring-2 ring-[#121320]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-white font-bold tracking-tight truncate">
                {match.name}
              </span>
              <span className="text-body-md" title={match.country}>
                {match.flag}
              </span>
              {(match.isAi || match.name.includes('AI')) && (
                <span className="px-2 py-0.5 rounded-full bg-[#756cf6]/20 text-[#e3dfff] text-[11px] font-semibold border border-[#756cf6]/30 shrink-0">
                  AI Companion
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-caption text-caption text-neutral-400 truncate">
                {match.interests && match.interests.length > 0
                  ? match.interests.join(' · ')
                  : 'Random Discovery'}
              </span>
            </div>
          </div>
        </div>

        {/* Video Mode Badge & Back Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#756cf6]/15 border border-[#756cf6]/30 text-[#e3dfff] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-state-success animate-ping" />
            <span>📹 Video Call Mode</span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            title="Return to Text Chat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Remote Video Container */}
      <div className="relative w-full max-w-5xl flex-1 rounded-3xl overflow-hidden bg-[#0d0e17] border border-[#e3dfff]/15 my-3 sm:my-4 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {permissionError ? (
          <div className="p-8 text-center max-w-md space-y-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">videocam_off</span>
            </div>
            <h3 className="text-white font-bold text-headline-sm">Camera Access Needed</h3>
            <p className="text-neutral-300 font-body-sm">{permissionError}</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#756cf6] to-[#5146d0] text-white font-semibold text-body-sm hover:opacity-95 shadow-lg transition-all"
            >
              Return to Text Chat
            </button>
          </div>
        ) : match.isAi ? (
          /* Futuristic AI Companion Holographic Stream View */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0d0e17] via-[#121324] to-[#1a1738] relative overflow-hidden">
            {/* Animated Background Ring Aura */}
            <div className="absolute w-72 h-72 rounded-full border border-[#756cf6]/20 animate-ping pointer-events-none" style={{ animationDuration: '4s' }} />
            <div className="absolute w-96 h-96 rounded-full border border-[#756cf6]/10 animate-ping pointer-events-none" style={{ animationDuration: '6s' }} />

            <div className="relative">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-[#756cf6]/50 shadow-[0_0_50px_rgba(117,108,246,0.4)] transition-transform duration-500">
                <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-state-success text-white font-bold text-[11px] shadow-lg flex items-center gap-1 border border-white/20">
                <span>🤖</span> AI LIVE
              </span>
            </div>

            <h3 className="text-white font-bold text-headline-md mt-5 tracking-tight">{match.name}</h3>
            <p className="text-[#e3dfff] font-body-sm font-medium mt-1">Interactive AI Video Companion</p>

            {/* Sound Wave Bars Simulation */}
            <div className="flex items-center gap-1.5 mt-6 h-8">
              {[40, 75, 50, 90, 60, 85, 45, 70, 95, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-[#756cf6] to-[#e3dfff] animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {/* Icebreaker Prompt Overlay */}
            {match.icebreaker && (
              <div className="mt-6 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-sm text-center">
                <p className="text-xs text-neutral-300 font-medium">
                  <strong className="text-[#e3dfff]">Icebreaker:</strong> "{match.icebreaker}"
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Real Partner WebRTC Video Stream */
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!remoteMediaState.videoEnabled ? 'hidden' : ''}`}
            />

            {(!remoteMediaState.videoEnabled || connectionState !== 'connected') && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0d0e17]">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-[36px] font-bold shadow-2xl animate-pulse">
                  {match.name.substring(0, 1).toUpperCase()}
                </div>
                <p className="text-neutral-300 font-medium text-body-md mt-5">
                  {connectionState === 'connecting'
                    ? 'Establishing WebRTC Connection...'
                    : 'Partner video is currently paused'}
                </p>
                <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-[#756cf6] animate-ping" />
                  <span>Waiting for partner stream</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Local Camera Floating PIP (Picture-In-Picture) Window */}
        <div className="absolute bottom-4 right-4 w-32 sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950/90 border-2 border-white/20 shadow-2xl z-20 backdrop-blur-xl group">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-neutral-400 p-2">
              <span className="material-symbols-outlined text-[28px] text-neutral-500">videocam_off</span>
              <span className="text-[10px] font-medium mt-1">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-state-success" />
            <span>You</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Video Controls Capsule */}
      <div className="w-full max-w-xl bg-[#161726]/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)] rounded-full px-5 py-3 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          {/* Microphone Toggle */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMicOn
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                : 'bg-red-500/90 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isMicOn ? 'mic' : 'mic_off'}
            </span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCameraOn
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                : 'bg-red-500/90 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isCameraOn ? 'videocam' : 'videocam_off'}
            </span>
          </button>

          {/* Switch to Text Chat Mode */}
          <button
            onClick={onClose}
            className="h-12 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer"
            title="Switch to Text Chat window"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span className="hidden sm:inline">Text Chat</span>
          </button>
        </div>

        {/* Next Stranger / Skip Button */}
        <button
          onClick={onSkip}
          className="h-12 px-6 rounded-full bg-gradient-to-r from-[#756cf6] to-[#5146d0] hover:from-[#6459f4] hover:to-[#4338be] text-white font-semibold text-body-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(117,108,246,0.4)] active:scale-95 transition-all cursor-pointer"
        >
          <span>Next Person</span>
          <span className="material-symbols-outlined text-[18px]">fast_forward</span>
        </button>
      </div>
    </div>
  );
};

export default VideoChatOverlay;
