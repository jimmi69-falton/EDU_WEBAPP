import React, { useState, useEffect, useRef } from 'react';
import Modal from '../UI/Modal';
import Card from '../UI/Card';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VideoPlayerWithCheckpoints = ({ youtubeUrl, checkpoints, onCheckpointAnswer, lessonId }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [checkpointAnswered, setCheckpointAnswered] = useState(new Set());
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerIdRef = useRef(`youtube-player-${Date.now()}`);
  const showCheckpointModalRef = useRef(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(youtubeUrl);
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1` 
    : null;

  // Load YouTube IFrame API
  useEffect(() => {
    const initializePlayer = () => {
      const container = document.getElementById(playerIdRef.current);
      if (videoId && container && !playerRef.current) {
        try {
          playerRef.current = new window.YT.Player(playerIdRef.current, {
            videoId: videoId,
            playerVars: {
              controls: 0, // Disable controls to prevent skipping
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              playsinline: 1,
              enablejsapi: 1,
            },
            events: {
              onReady: (event) => {
                // Start tracking time
                startTimeTracking(event.target);
              },
              onStateChange: (event) => {
                // Handle state changes
                if (event.data === window.YT.PlayerState.PAUSED && !isPaused) {
                  // Video was paused externally
                }
              },
            },
          });
        } catch (e) {
          console.error('Error initializing YouTube player:', e);
        }
      }
    };

    if (!window.YT) {
      // Load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Set up callback
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      // API already loaded
      initializePlayer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error('Error destroying player:', e);
        }
      }
    };
  }, [videoId, checkpoints]);

  // Update ref when showCheckpointModal changes
  useEffect(() => {
    showCheckpointModalRef.current = showCheckpointModal;
  }, [showCheckpointModal]);

  // Use ref for checkpointAnswered to avoid closure issues
  const checkpointAnsweredRef = useRef(new Set());
  
  useEffect(() => {
    checkpointAnsweredRef.current = checkpointAnswered;
  }, [checkpointAnswered]);

  // Start tracking video time
  const startTimeTracking = (player) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      try {
        // Don't check for new checkpoints if modal is already open
        if (showCheckpointModalRef.current) {
          return;
        }
        
        const time = Math.floor(player.getCurrentTime());
        setCurrentTime(time);

        // Check for checkpoints
        if (checkpoints && checkpoints.length > 0) {
          const checkpoint = checkpoints.find(
            cp => {
              // Check if checkpoint is within 1 second of current time
              const timeDiff = Math.abs(time - cp.timeInSeconds);
              // Check if checkpoint hasn't been answered (use ref to avoid closure)
              const notAnswered = !checkpointAnsweredRef.current.has(cp.id);
              // Check if we're at or past the checkpoint time (not before)
              const atOrPastCheckpoint = time >= cp.timeInSeconds;
              
              return timeDiff < 1 && notAnswered && atOrPastCheckpoint;
            }
          );
          
          if (checkpoint) {
            // Pause video
            player.pauseVideo();
            setIsPaused(true);
            setCurrentCheckpoint(checkpoint);
            setShowCheckpointModal(true);
            setUserAnswer('');
            setShowResult(false);
            // Update ref immediately
            showCheckpointModalRef.current = true;
          }
        }
      } catch (e) {
        console.error('Error tracking time:', e);
      }
    }, 500); // Check every 500ms
  };

  // Handle checkpoint answer submission
  const handleCheckpointSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentCheckpoint || !userAnswer || userAnswer.trim() === '') {
      toast.error('Vui lòng chọn đáp án!');
      return;
    }

    const correct = userAnswer.trim() === currentCheckpoint.correctAnswer.trim();
    setIsCorrect(correct);
    setShowResult(true);
    setCheckpointAnswered(new Set([...checkpointAnswered, currentCheckpoint.id]));

    // Call API to save progress
    if (onCheckpointAnswer) {
      onCheckpointAnswer(currentCheckpoint.id, userAnswer, correct);
    }
  };

  // Handle continue video after answering
  const handleContinue = () => {
    // Save checkpoint info before resetting state
    const checkpointToSkip = currentCheckpoint;
    
    // Mark checkpoint as answered before closing modal
    if (checkpointToSkip) {
      setCheckpointAnswered(new Set([...checkpointAnswered, checkpointToSkip.id]));
    }
    
    setShowCheckpointModal(false);
    setShowResult(false);
    setUserAnswer('');
    setCurrentCheckpoint(null);
    showCheckpointModalRef.current = false;
    
    // Resume video and skip past checkpoint time
    if (playerRef.current && checkpointToSkip) {
      try {
        // Skip 2 seconds past the checkpoint to avoid retriggering
        const skipTime = checkpointToSkip.timeInSeconds + 2;
        playerRef.current.seekTo(skipTime, true);
        playerRef.current.playVideo();
        setIsPaused(false);
      } catch (e) {
        console.error('Error resuming video:', e);
      }
    }
  };

  // Prevent modal from closing
  const handleModalClose = () => {
    // Do nothing - modal cannot be closed until answered
  };

  if (!embedUrl) {
    return <div className="text-red-500 p-4">URL video không hợp lệ</div>;
  }

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
    try {
      return JSON.parse(optionsString);
    } catch (e) {
      return [];
    }
  };

  return (
    <>
      <div className="relative w-full">
        <div className="aspect-video bg-black rounded-lg overflow-hidden w-full">
          <div id={playerIdRef.current} className="w-full h-full"></div>
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm z-10">
          Anti-skip: Bật
        </div>
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-white text-lg font-semibold">Video đã tạm dừng</div>
          </div>
        )}
      </div>

      {/* Checkpoint Modal - Cannot be closed */}
      <Modal isOpen={showCheckpointModal} onClose={handleModalClose} size="lg" showCloseButton={false}>
        <Card className="p-6">
          {!showResult ? (
            <>
              <h3 className="text-2xl font-bold mb-4">Checkpoint</h3>
              {currentCheckpoint && (
                <>
                  <p className="text-lg mb-6 font-medium">{currentCheckpoint.question}</p>
                  
                  {currentCheckpoint.questionType === 'MCQ' && (
                    <div className="space-y-3">
                      {parseOptions(currentCheckpoint.options).map((option, index) => (
                        <label
                          key={`${currentCheckpoint.id}-${index}`}
                          htmlFor={`checkpoint-option-${currentCheckpoint.id}-${index}`}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            userAnswer === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserAnswer(option);
                          }}
                        >
                          <input
                            id={`checkpoint-option-${currentCheckpoint.id}-${index}`}
                            type="radio"
                            name={`checkpoint-answer-${currentCheckpoint.id}`}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setUserAnswer(e.target.value);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserAnswer(option);
                            }}
                            className="mr-3 w-5 h-5 cursor-pointer"
                          />
                          <span className="text-gray-800 cursor-pointer flex-1">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentCheckpoint.questionType === 'TRUE_FALSE' && (
                    <div className="space-y-3">
                      {['Đúng', 'Sai'].map((option, index) => (
                        <label
                          key={`${currentCheckpoint.id}-tf-${index}`}
                          htmlFor={`checkpoint-tf-${currentCheckpoint.id}-${index}`}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            userAnswer === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserAnswer(option);
                          }}
                        >
                          <input
                            id={`checkpoint-tf-${currentCheckpoint.id}-${index}`}
                            type="radio"
                            name={`checkpoint-answer-${currentCheckpoint.id}`}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setUserAnswer(e.target.value);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserAnswer(option);
                            }}
                            className="mr-3 w-5 h-5 cursor-pointer"
                          />
                          <span className="text-gray-800 cursor-pointer">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentCheckpoint.questionType === 'SHORT' && (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="input w-full text-lg"
                      placeholder="Nhập câu trả lời"
                      autoFocus
                    />
                  )}

                  <div className="mt-6">
                    <motion.button
                      type="button"
                      onClick={handleCheckpointSubmit}
                      disabled={!userAnswer || userAnswer.trim() === ''}
                      whileHover={userAnswer && userAnswer.trim() !== '' ? { scale: 1.02 } : {}}
                      whileTap={userAnswer && userAnswer.trim() !== '' ? { scale: 0.98 } : {}}
                      className={`btn btn-primary w-full py-3 text-lg ${
                        !userAnswer || userAnswer.trim() === '' 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer'
                      }`}
                      style={{ pointerEvents: (!userAnswer || userAnswer.trim() === '') ? 'none' : 'auto' }}
                    >
                      {userAnswer && userAnswer.trim() !== '' ? 'Trả lời' : 'Vui lòng chọn đáp án'}
                    </motion.button>
                  </div>
                </>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {isCorrect ? (
                <>
                  <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Đúng rồi!</h3>
                  {currentCheckpoint?.explanation && (
                    <p className="text-gray-700 mt-4 mb-6">{currentCheckpoint.explanation}</p>
                  )}
                </>
              ) : (
                <>
                  <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-600 mb-2">Sai rồi!</h3>
                  <p className="text-gray-700 mb-2">
                    Đáp án đúng: <span className="font-semibold">{currentCheckpoint?.correctAnswer}</span>
                  </p>
                  {currentCheckpoint?.explanation && (
                    <p className="text-gray-700 mt-4 mb-6">{currentCheckpoint.explanation}</p>
                  )}
                </>
              )}
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary mt-6 px-8 py-3 text-lg"
              >
                Xem tiếp
              </motion.button>
            </motion.div>
          )}
        </Card>
      </Modal>
    </>
  );
};

export default VideoPlayerWithCheckpoints;
