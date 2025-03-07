"use client"
import { AudioLines, Captions, CaptionsOff, CircleGauge, Expand, Minimize, Pause, Play, Settings, Volume1, Volume2, VolumeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Range from "@/components/shared-ui/range";
import { usePlayer } from "@/shared/hooks/use-player";
import SettingsOptions from "./settings-options";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "../shared-ui/loader";

interface PlayerProps {
    src: string | undefined
    changeQualitySrc: (quality: number) => void
    width: string
    height: string
    availableQualities: number[]
}

export default function Player({ src, changeQualitySrc, width, height, availableQualities }: PlayerProps) {

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null)
    const tempVideoRef = useRef<HTMLVideoElement>(null);

    const {videoStates, togglePause, toggleFullScreen, handleSeek, changeVolume, setWindow, changeSpeed,  changeQuality, toggleMute, previewFuncs} = 
        usePlayer({videoRef, playerRef, settingsRef, previewRef, tempVideoRef, changeQualitySrc, availableQualities})

    return (
        <div 
            ref={playerRef} 
            className={`relative text-white select-none ${videoStates.idle ? "cursor-none" : ""}`}
            style={{width: String(width), height: String(height)}}
        >
            {
                videoStates.loading &&
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
                    <Loader />
                </div>
            }
            <AnimatePresence>
            {
                videoStates.previewVisible &&
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        ref={previewRef}
                        className="absolute bottom-15 left-0 flex flex-col items-center"
                        style={{ transform: "translateX(var(--preview-pos, 0px))" }}
                    >
                        <canvas 
                            className="w-[250px] h-[120px] border rounded-[10px] bg-black"
                        />
                        <div>
                            {Math.floor((tempVideoRef.current?.currentTime || 1) / 60)}:{String(Math.floor((tempVideoRef.current?.currentTime || 1) % 60)).padStart(2, "0")}
                        </div>
                    </motion.div>
            }
            </AnimatePresence>
            <div className={`absolute bottom-0 left-0 w-full z-10 transition-opacity duration-300 
                ${!videoStates.idle ? "opacity-100" : "opacity-0"}`}
            >   
                <div className="pt-[2%] px-2">
                    <Range 
                        value={[videoRef.current && videoRef.current.duration 
                            ? (videoStates.currentTime * 100) / videoRef.current.duration
                            : 0]}
                        className="w-full relative z-1"
                        variants="red"
                        onValueChange={(value) => handleSeek(value[0])}
                        onPointerMove={previewFuncs.handle}
                        onPointerLeave={previewFuncs.hide}
                        onPointerEnter={previewFuncs.show}
                    />
                </div>
                <div className="gray-glass flex py-2 justify-between px-2">
                    <div className="flex gap-2">
                        <div onClick={togglePause} className="rounded-full bg-[#00000052] cursor-pointer p-1.5">
                        {
                            !videoStates.isPlaying ?
                                <Play color="#fff" fill="#fff" stroke="none" className="cursor-pointer transition-all hover:scale-[1.2]" />
                                :
                                <Pause color="#fff" fill="#fff" stroke="none" className="cursor-pointer transition-all hover:scale-[1.2]" />
                        }
                        </div>
                        <div className="rounded-full bg-[#00000052] p-1.5 cursor-pointer flex gap-2 max-w-[32px] overflow-hidden hover:max-w-[100%] transition-all">
                            {   
                                videoStates.muted ? 
                                <motion.div
                                    initial={{opacity: 0, scale: 0.7}}
                                    animate={{opacity: 1, scale: 1}}
                                    key="VolumeOff"
                                >
                                    <VolumeOff 
                                        onClick={toggleMute} 
                                        size={24} 
                                        color="#fff" 
                                        className={`cursor-pointer flex-none transition-all hover:rotate-[-20deg]`}
                                    />
                                </motion.div>
                                :
                                videoStates.volume >= 50 ? 
                                <motion.div
                                    initial={{opacity: 0, scale: 0.7}}
                                    animate={{opacity: 1, scale: 1}}
                                    key="Volume2"
                                >
                                    <Volume2 
                                        onClick={toggleMute} 
                                        size={24} 
                                        color="#fff" 
                                        className="cursor-pointer flex-none transition-all hover:rotate-[20deg]"
                                    />
                                </motion.div>
                                :
                                <motion.div
                                    initial={{opacity: 0, scale: 0.7}}
                                    animate={{opacity: 1, scale: 1}}
                                    key="Volume1"
                                >
                                    <Volume1 
                                        onClick={toggleMute} 
                                        size={24} 
                                        color="#fff" 
                                        className="cursor-pointer flex-none transition-all hover:rotate-[-20deg]" 
                                    />
                                </motion.div>
                            }
                            <Range 
                                className="w-[100px] flex-none" 
                                variants="white" 
                                value={[videoStates.muted ? 0 : videoStates.volume]}
                                onValueChange={(value) => changeVolume(value[0])}
                            />
                        </div>
                        <div className="text-white flex items-center">
                            {Math.floor(videoStates.currentTime / 60)}:{String(Math.floor(videoStates.currentTime % 60)).padStart(2, "0")}
                            /
                            {videoRef.current?.duration
                                ? `${Math.floor(videoRef.current.duration / 60)}:${String(Math.floor(videoRef.current.duration % 60)).padStart(2, "0")}`
                                : "0:00"}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="rounded-full bg-[#00000052] p-1.5 cursor-pointer">
                            <CaptionsOff className="transition-all hover:scale-y-125 hover:scale-x-95" />
                        </div>
                        <div className="rounded-full bg-[#00000052] p-1.5 cursor-pointer" onClick={() => setWindow("settings")}>
                            <Settings className="cursor-pointer transition-all hover:rotate-45 active:scale-[1.3]"/>
                        </div>
                        <div className="rounded-full bg-[#00000052] p-1.5 cursor-pointer">
                        {
                            !videoStates.fullScreen ?
                                <Expand color="#fff" onClick={() => toggleFullScreen()} className="cursor-pointer transition-all hover:scale-[1.2]"/>
                                :
                                <Minimize color="#fff" onClick={() => toggleFullScreen()} className="cursor-pointer transition-all hover:scale-[1.2]"/>
                        }
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-full bg-black" onClick={() => videoStates.window == "" && togglePause()}>
                <video
                    ref={videoRef} 
                    className="w-full h-full" 
                    src={src}
                    preload="metadata"
                >
                </video>
            </div>
            <AnimatePresence>
                {
                    videoStates.window !== "" &&
                    <motion.div
                        ref={settingsRef}
                        className="black-glass absolute right-2 w-[300px] max-w-[100%] rounded-[8px] transition-all duration-300 ease-in-out overflow-hidden"
                        style={{bottom: "calc(60px + 2%)"}}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >   
                        {
                            videoStates.window == "settings" &&
                            <motion.div
                                initial={{maxHeight: 0,opacity: 0}}
                                animate={{maxHeight: 100, opacity: 1}}
                                exit={{opacity: 0}}
                            >
                                <div 
                                    className="flex justify-between py-2 px-4 cursor-pointer hover:bg-[#ffffff38] transition-colors duration-300 ease-in"
                                    style={{maxHeight: videoStates.window == "settings" ? "100%" : "0"}}
                                    onClick={() => setWindow("quality")}
                                >
                                    <div className="flex gap-2 items-center" >
                                        <AudioLines color="#fff" size={17} />
                                        <div className="mb-0.5">Quality</div>
                                    </div>
                                    <div>
                                        {videoStates.quality}p
                                    </div>
                                </div>
                                <div 
                                    className="flex justify-between py-2 px-4 cursor-pointer hover:bg-[#ffffff38] transition-colors duration-300 ease-in" 
                                    onClick={() => setWindow("speed")}
                                >
                                    <div className="flex gap-2 items-center">
                                        <CircleGauge size={17} />
                                        <div className="mb-0.5">Speed</div>
                                    </div>
                                    <div>
                                        {videoRef.current?.playbackRate || 1}x
                                    </div>
                                </div>
                            </motion.div>
                        }
                        {
                            videoStates.window == "speed" &&
                            <SettingsOptions 
                                options={["0.5x", "0.75x", "1x", "1.25x", "1.5x", "1.75x", "2x"]} 
                                setWindow={setWindow} 
                                changeState={changeSpeed}
                                title="Speed"
                            />
                        }
                        {
                            videoStates.window == "quality" &&
                            <SettingsOptions 
                                options={availableQualities.map(el => `${el}p`)} 
                                setWindow={setWindow} 
                                changeState={changeQuality}
                                title="Quality"
                            />
                        }
                    </motion.div>
                }
            </AnimatePresence>
            <video
                style={{display: "none"}}
                src={src}
                preload="metadata"
                ref={tempVideoRef}
            />
        </div>
    );
}
