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

        // Initiate offer (determinisitic offer by room creator or socket ID order)
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
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 select-none font-sans">
      {/* Top Bar Header */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src="/icons/chattr-icon-96x96.png"
            alt="Chattr Logo"
            className="w-8 h-8 rounded-full shadow-md shrink-0 object-cover"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-white font-bold tracking-tight">
                {match.name}
              </span>
              {(match.isAi || match.name.includes('AI')) && (
                <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-fixed text-[11px] font-semibold border border-secondary/30">
                  AI companion
                </span>
              )}
            </div>
            <span className="font-caption text-caption text-neutral-400">
              {match.interests.join(' · ')}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white flex items-center justify-center transition-all cursor-pointer"
          title="Return to Text Chat"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Main Remote Video Container */}
      <div className="relative w-full max-w-5xl flex-1 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 my-4 flex items-center justify-center">
        {permissionError ? (
          <div className="p-8 text-center max-w-md space-y-4">
            <span className="material-symbols-outlined text-[48px] text-red-400">videocam_off</span>
            <p className="text-white font-semibold text-body-md">{permissionError}</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-body-sm hover:opacity-95"
            >
              Continue in Text Chat
            </button>
          </div>
        ) : match.isAi ? (
          /* AI Companion Video Presentation Feed */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/40 relative">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-secondary/40 shadow-2xl animate-pulse">
                <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-state-success ring-4 ring-neutral-900 flex items-center justify-center text-[12px] text-white">
                🤖
              </span>
            </div>
            <h3 className="text-white font-bold text-headline-sm mt-4">{match.name}</h3>
            <p className="text-secondary text-body-sm font-medium mt-1">Interactive AI Video Companion</p>
            <div className="mt-6 px-4 py-2 rounded-full bg-neutral-800/60 border border-neutral-700/60 text-neutral-300 text-caption font-mono">
              Listening & Ready to talk...
            </div>
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
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-neutral-900">
                <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[32px] font-bold">
                  {match.name.substring(0, 1)}
                </div>
                <p className="text-neutral-400 font-medium text-body-sm mt-4">
                  {connectionState === 'connecting'
                    ? 'Connecting Video Stream...'
                    : 'Partner camera is turned off'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Local Camera Floating Preview Window (PIP) */}
        <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border-2 border-neutral-700/80 shadow-xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400">
              <span className="material-symbols-outlined text-[24px]">videocam_off</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Video Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-4 z-10">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isMicOn
              ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isMicOn ? 'mic' : 'mic_off'}
          </span>
        </button>

        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isCameraOn
              ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isCameraOn ? 'videocam' : 'videocam_off'}
          </span>
        </button>

        {/* Skip / Next Partner Button */}
        <button
          onClick={onSkip}
          className="h-12 px-6 rounded-full bg-primary hover:opacity-95 text-on-primary font-semibold text-body-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <span>Next Person</span>
          <span className="material-symbols-outlined text-[18px]">fast_forward</span>
        </button>
      </div>
    </div>
  );
};
