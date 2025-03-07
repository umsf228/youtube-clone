import { RefObject, useEffect, useRef, useState } from "react"

interface usePlayerProps {
    videoRef: RefObject<HTMLVideoElement | null>
    playerRef: RefObject<HTMLDivElement | null>
    settingsRef: RefObject<HTMLDivElement | null>
    previewRef: RefObject<HTMLDivElement | null>
    tempVideoRef: RefObject<HTMLVideoElement | null>
    changeQualitySrc: (quality: number) => void
    availableQualities: number[]
}

export function usePlayer({videoRef, playerRef, settingsRef, previewRef, tempVideoRef, changeQualitySrc, availableQualities} : usePlayerProps) {
    const [videoStates, setVideoStates] = useState({
        isPlaying: false,
        currentTime: 0,
        fullScreen: false,
        idle: false,
        volume: 50,
        window: "",
        loading: false,
        quality: 144,
        muted: false,
        previewVisible: false
    })
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimeout = () => {
        setVideoStates(prev => ({...prev, idle: false}))
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current?.paused) {
                setVideoStates(prev => ({...prev, idle: true, window: ""}))
            }
        }, 1500);
    };

    const changeSpeed = (value: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = value
            setVideoStates(prev => ({...prev, window: "settings"}))
        }
    }

    const changeQuality = (value: number) => {
        if (videoRef.current) {
            setVideoStates(prev => ({...prev, window: "settings", quality: value, isPlaying: false}))
            changeQualitySrc(value)
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = videoStates.currentTime; // Восстанавливаем позицию
                    togglePause(); // Воспроизводим снова
                }
            }, 200);
        }
    }
    
    const togglePause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play()
                setVideoStates(prev => ({...prev, isPlaying: true}))
            } else {
                videoRef.current.pause()
                setVideoStates(prev => ({...prev, isPlaying: false}))
            }
        }
    }

    const toggleFullScreen = () => {
        if (playerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                setVideoStates(prev => ({...prev, fullScreen: false}))
            } else {
                playerRef.current.requestFullscreen()
                setVideoStates(prev => ({...prev, fullScreen: true}))
            }
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            if (videoStates.volume == 0) {
                return
            }
            if (videoRef.current.muted) {
                videoRef.current.muted = false
                setVideoStates(prev => ({...prev, muted: false}))
            } else {
                videoRef.current.muted = true
                setVideoStates(prev => ({...prev, muted: true}))
            }
        }
    }

    const handleSeek = (percent: number) => {
        if (videoRef.current && videoRef.current.duration) {
            const newTime = (percent / 100) * videoRef.current.duration;

            const wasPlaying = !videoRef.current.paused;
            videoRef.current.pause();
            videoRef.current.currentTime = newTime;

            setTimeout(() => {
                if (wasPlaying) {
                    videoRef.current?.play()
                    setVideoStates(prev => ({ ...prev, isPlaying: true}))
                }
            }, 500);

            setVideoStates(prev => ({ ...prev, currentTime: newTime, isPlaying: false}));

            resetTimeout();
        }
    };

    const changeVolume = (percent: number) => {
        if (videoRef.current) {
            videoRef.current.volume = percent / 100
            if (percent / 100 == 0) {
                setVideoStates(prev => ({...prev, volume: percent, muted: true}))
                resetTimeout();
                return
            }
            setVideoStates(prev => ({...prev, volume: percent, muted: false}))
            resetTimeout();
        }
    }

    const setWindow = (value: string) => {
        if (!value) {
            setVideoStates(prev => ({...prev, window: ""}))
            return
        }
        setVideoStates(prev => ({...prev, window: value}))
    }

    const handlePreview = (e: React.PointerEvent) => {
        if (!videoRef.current || !previewRef.current || !tempVideoRef.current) return;
    
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const previewTime = percent * (videoRef.current.duration || 1);
        tempVideoRef.current.currentTime = previewTime;
        const canvas = previewRef.current.children[0] as HTMLCanvasElement
    
        tempVideoRef.current.onseeked = () => {
            const ctx = canvas.getContext("2d");
            if (ctx && tempVideoRef.current && previewRef.current) {
                const videoWidth = tempVideoRef.current.videoWidth;
                const videoHeight = tempVideoRef.current.videoHeight;
    
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
    
                // Вычисляем коэффициент масштабирования для сохранения пропорций
                const scale = Math.min(canvasWidth / videoWidth, canvasHeight / videoHeight);
                const drawWidth = videoWidth * scale;
                const drawHeight = videoHeight * scale;
    
                // Вычисляем отступы для центрирования
                const offsetX = (canvasWidth - drawWidth) / 2;
                const offsetY = (canvasHeight - drawHeight) / 2;
    
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(tempVideoRef.current, offsetX, offsetY, drawWidth, drawHeight);
            }
        };

        const preview = previewRef.current.getBoundingClientRect()
        const videoWidth = rect.width;

        const cursorX = e.clientX - rect.left;
        let previewPos = cursorX - (preview.width / 2) + 10;

        // Ограничения, чтобы превью не выходило за границы
        if (previewPos < 10) previewPos = 6; // Левый край
        if (previewPos + preview.width - 10 > videoWidth) previewPos = videoWidth - preview.width + 10; // Правый край

        document.documentElement.style.setProperty("--preview-pos", `${previewPos}px`);
    }

    const previewFuncs = {
        handle: handlePreview,
        hide: () => setVideoStates(prev => ({...prev, previewVisible: false})),
        show: () => setVideoStates(prev => ({...prev, previewVisible: true})),
    }

    useEffect(() => {
        const timeUpdate = setInterval(() => {
            if (videoRef.current) {
                setVideoStates(prev => ({...prev, currentTime: videoRef.current?.currentTime || 0}))
            }
        }, 500)
        return () => clearInterval(timeUpdate)
    }, [])

    useEffect(() => {
        const handleUserActivity = () => resetTimeout();
        
        document.addEventListener("mousemove", handleUserActivity);
        document.addEventListener("keydown", handleUserActivity);
        document.addEventListener("click", handleUserActivity);
        
        resetTimeout()

        return () => {
            document.removeEventListener("mousemove", handleUserActivity);
            document.removeEventListener("keydown", handleUserActivity);
            document.removeEventListener("click", handleUserActivity);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setTimeout(() => setVideoStates((prev) => ({ ...prev, window: "" })), 100)
            }
        };

        if (videoStates.window) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [videoStates.window]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleWaiting = () => setVideoStates(prev => ({...prev, loading: true}));  // Началась буферизация
        const handleCanPlay = () => setVideoStates(prev => ({...prev, loading: false})); // Видео готово к воспроизведению
        const handleSeeking = () => setVideoStates(prev => ({...prev, loading: true}));  // Пользователь перематывает
        const handleSeeked = () => setVideoStates(prev => ({...prev, loading: false})); // Завершена перемотка

        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("seeking", handleSeeking);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("seeking", handleSeeking);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, []);

    useEffect(() => setVideoStates(prev => ({...prev, quality: availableQualities[0]})),[availableQualities])

    return {videoStates, togglePause, toggleFullScreen, handleSeek, changeVolume, setWindow, changeSpeed, changeQuality, toggleMute, previewFuncs}
}