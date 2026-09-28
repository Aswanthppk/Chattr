import React, { useEffect, useRef, useState } from 'react';
import { UserMatch } from '../types';
import { socketService } from '../services/SocketService';
import { OrbVisual } from './OrbVisual';

interface VideoChatOverlayProps {
  match: UserMatch;
  onClose: () => void;
  onSkip: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [remoteMediaState, setRemoteMediaState] = useState({ videoEnabled: true, audioEnabled: true });
  const [partnerLeft, setPartnerLeft] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up media tracks and WebRTC connection
  const cleanupMediaAndPeer = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const setupMediaAndWebRTC = async () => {
    setPermissionError('');
    try {
      // 1. Request camera/microphone permissions only when entering Video Chat
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // If partner is an AI companion, simulate connected state
      if (match.isAi) {
        setConnectionState('connected');
        return;
      }

      // 2. Setup RTCPeerConnection for WebRTC video call
      const peer = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnectionState('connected');
        }
      };

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

      // Listen for incoming WebRTC signals
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
          console.error('[WebRTC Signal Exception]', err);
        }
      });

      // Listen for partner track mute state changes
      const unsubState = socketService.onWebRtcState((state) => {
        setRemoteMediaState(state);
      });

      // Deterministic offerer selection to prevent WebRTC SDP offer collision
      const myId = socketService.getUserId();
      const isOfferer = myId < match.id;

      if (isOfferer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketService.sendWebRtcSignal({ sdp: peer.localDescription });
      }

      return () => {
        unsubSignal();
        unsubState();
      };
    } catch (err: any) {
      console.error('[Camera Access Error]', err);
      setPermissionError(
        'Camera and microphone access is required for video chat.'
      );
    }
  };

  useEffect(() => {
    setupMediaAndWebRTC();

    // Listen for partner disconnect
    const unsubPartnerLeft = socketService.onPartnerLeft(() => {
      setPartnerLeft(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    // Browser navigation / refresh / tab close cleanup handlers
    const handleUnload = () => {
      cleanupMediaAndPeer();
      socketService.leaveChat();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('popstate', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('popstate', handleUnload);
      unsubPartnerLeft();
      cleanupMediaAndPeer();
    };
  }, [match.id]);

  // Toggle Microphone locally without disconnecting WebRTC call
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
        socketService.sendWebRtcState(!isMicOn, isCameraOn);
      }
    }
  };

  // Toggle Camera locally without disconnecting WebRTC call
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
        socketService.sendWebRtcState(isMicOn, !isCameraOn);
      }
    }
  };

  // Next Button Flow
  const handleNext = () => {
    cleanupMediaAndPeer();
    socketService.leaveChat();
    onSkip();
  };

  // End Button Flow
  const handleEnd = () => {
    cleanupMediaAndPeer();
    socketService.leaveChat();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-text-primary flex flex-col items-center justify-between p-3 sm:p-6 select-none font-sans overflow-hidden">
      {/* Top Bar Header */}
      <div className="w-full max-w-5xl bg-surface/90 backdrop-blur-md border border-border-subtle rounded-2xl p-3 sm:px-5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={match.avatarUrl || '/icons/chattr-icon-96x96.png'}
              alt={match.name}
              className="w-10 h-10 rounded-full border border-border-subtle object-cover shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-state-success ring-2 ring-surface" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-text-primary font-semibold tracking-tight truncate">
                {match.name}
              </span>
              <span className="text-body-md" title={match.country}>
                {match.flag}
              </span>
              {(match.isAi || match.name.includes('AI')) && (
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-medium border border-border-subtle shrink-0">
                  AI Companion
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-caption text-caption text-text-secondary truncate">
                {match.interests && match.interests.length > 0
                  ? match.interests.join(' · ')
                  : 'Random Discovery'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-border-subtle text-text-secondary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-state-success animate-ping" />
            <span className="material-symbols-outlined text-[15px]">videocam</span>
            <span>Video Call</span>
          </div>

          <button
            onClick={handleEnd}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="End Video Call"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Remote Video Container */}
      <div className="relative w-full max-w-5xl flex-1 rounded-3xl overflow-hidden bg-surface-dark border border-border-subtle my-3 sm:my-4 flex items-center justify-center shadow-lg">
        {permissionError ? (
          /* Camera Permission Denied State */
          <div className="p-8 text-center max-w-md space-y-4 bg-surface rounded-3xl border border-border-subtle shadow-xl m-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">videocam_off</span>
            </div>
            <h3 className="text-text-primary font-semibold text-headline-sm">Camera Permission Required</h3>
            <p className="text-text-secondary font-body-sm">{permissionError}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={setupMediaAndWebRTC}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-on-primary font-medium text-body-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={handleEnd}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-surface-container text-text-primary border border-border-subtle font-medium text-body-sm hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Continue with Text Chat
              </button>
            </div>
          </div>
        ) : partnerLeft ? (
          /* Partner Disconnected State */
          <div className="p-8 text-center max-w-md space-y-4 bg-surface rounded-3xl border border-border-subtle shadow-xl m-4">
            <OrbVisual size="sm" />
            <h3 className="text-text-primary font-semibold text-headline-sm mt-2">Your chat partner left.</h3>
            <p className="text-text-secondary font-body-sm">
              The other participant has disconnected from the video call.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-on-primary font-medium text-body-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Find Someone Else</span>
                <span className="material-symbols-outlined text-[16px]">fast_forward</span>
              </button>
              <button
                onClick={handleEnd}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-surface-container text-text-primary border border-border-subtle font-medium text-body-sm hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          /* Real Partner WebRTC Stream / Orb Placeholder */
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!remoteMediaState.videoEnabled ? 'hidden' : ''}`}
            />

            {(!remoteMediaState.videoEnabled || connectionState !== 'connected') && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-dark select-none">
                <OrbVisual size="md" />
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-text-primary text-[28px] font-semibold shadow-md -mt-10 border border-border-subtle">
                  {match.name.substring(0, 1).toUpperCase()}
                </div>
                <p className="text-text-primary font-medium text-body-md mt-4">
                  {connectionState === 'connecting'
                    ? 'Connecting video stream...'
                    : `${match.name}'s camera is paused`}
                </p>
              </div>
            )}
          </>
        )}

        {/* Local Camera Floating PIP Preview Window */}
        <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-surface border-2 border-border-subtle shadow-xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-text-secondary p-2">
              <OrbVisual size="sm" />
              <span className="text-[11px] font-medium text-text-muted mt-1">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-full bg-surface/80 backdrop-blur-sm text-[10px] text-text-primary font-medium flex items-center gap-1 border border-border-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-state-success" />
            <span>You</span>
          </div>
        </div>
      </div>

      {/* Floating Controls Bar: Microphone, Camera, Next, End */}
      <div className="w-full max-w-md bg-surface border border-border-subtle shadow-md rounded-full px-5 py-2.5 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          {/* Microphone Button */}
          <button
            onClick={toggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMicOn
                ? 'bg-surface-container hover:bg-surface-container-high text-text-primary border border-border-subtle'
                : 'bg-red-500 text-white shadow-sm'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMicOn ? 'mic' : 'mic_off'}
            </span>
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCameraOn
                ? 'bg-surface-container hover:bg-surface-container-high text-text-primary border border-border-subtle'
                : 'bg-red-500 text-white shadow-sm'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCameraOn ? 'videocam' : 'videocam_off'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Next Button */}
          <button
            onClick={handleNext}
            className="h-11 px-5 rounded-full bg-primary text-on-primary font-medium text-body-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <span>Next</span>
            <span className="material-symbols-outlined text-[16px]">fast_forward</span>
          </button>

          {/* End Button */}
          <button
            onClick={handleEnd}
            className="h-11 px-4 rounded-full bg-surface-container text-text-primary border border-border-subtle font-medium text-body-sm hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
          >
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChatOverlay;
