"use client"
import Player from "@/components/watch/player";
import { useEffect, useState } from "react";

export default function Page() {
    const [data, setData] = useState<any>(null)
    const [src, setSrc] = useState(undefined)
    const [qualities, setQualities] = useState([])
    
    useEffect(() => {
        (async function fetchVideo() {
            const response = await fetch("https://peertube3.cpy.re/api/v1/videos/369c3a07-f25e-48f5-90ef-97e6121269cf")
            const data = await response.json()
            setData(data)
            setSrc(data.files[0].fileUrl)
            setQualities(data.files.map((el: any) => el.resolution.id))
        })()
    },[])

    function changeQualitySrc(quality: number) {
        if (data) {
            const file = data.files.find((el: any) => el.resolution.id == quality)
            setSrc(file.fileUrl)
        }
    }

    return (
        <>  
            <div className="flex justify-center">
                <Player src={src} width={"800px"} height={"472px"} changeQualitySrc={changeQualitySrc} availableQualities={qualities} />
            </div>
        </>
    )
}