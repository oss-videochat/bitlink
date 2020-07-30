import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {ISettingsPanelProps} from '../SettingsViewer';
import './VideoEffects.css';
import StreamEffectStore from "../../../../stores/StreamEffectStore";
import HardwareService from "../../../../services/HardwareService";
import CameraStreamEffectsRunner from "../../../../util/CameraStreamEffectsRunner";
import StreamEffectService from "../../../../services/StreamEffectService";

const VideoEffects: React.FunctionComponent<ISettingsPanelProps> = ({events, changesMade, handleChangesMade}) => {
    const [shouldBlur, setShouldBlur] = useState(StreamEffectStore.blur);
    const [image, setImage] = useState<HTMLImageElement | null>( StreamEffectStore.image);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraStreamEffectsRunner = useRef<CameraStreamEffectsRunner>();

    useEffect(() => {
        const el = videoRef.current;
        function canplay(){
            el!.play();
        }

        if (videoRef.current) {
            if (cameraStreamEffectsRunner.current) {
                cameraStreamEffectsRunner.current.cancel();
            }
            if (shouldBlur) {
                HardwareService.getRawStream("camera")
                    .then((stream: MediaStream) => CameraStreamEffectsRunner.create(stream, true))
                    .then((cameraRunner) => {
                        cameraStreamEffectsRunner.current = cameraRunner;
                        videoRef.current!.srcObject = cameraRunner.getStream();
                    })
            } else if(image) {
                HardwareService.getRawStream("camera")
                    .then((stream: MediaStream) => CameraStreamEffectsRunner.create(stream, false, image))
                    .then((cameraRunner) => {
                        cameraStreamEffectsRunner.current = cameraRunner;
                        videoRef.current!.srcObject = cameraRunner.getStream();
                    });
            } else {
                HardwareService.getRawStream("camera").then((stream) => {
                    videoRef.current!.srcObject = stream;
                });
            }
            el!.addEventListener("canplay", canplay)
            return () => {
                el && el!.removeEventListener("canplay", canplay)
            }
        }
    }, [shouldBlur, image]);




    useEffect(() => {
        function onCancel(cb: () => void) {
            if (cameraStreamEffectsRunner.current) {
                cameraStreamEffectsRunner.current.cancel();
            }
        }

        async function onSave(cb: () => void) {
            if(!shouldBlur && !image){
                StreamEffectService.endEffects();
                return;
            }
            if(shouldBlur){
                await StreamEffectService.enableBlur();
            }
            if(image){
                await StreamEffectService.enableVirtualBackground(image);
            }
            cb();
        }

        events.on("save", onSave);
        events.on("cancel", onCancel);
        return () => {
            events.removeListener("save", onSave)
            events.removeListener("cancel", onSave)
        };
    }, [events, image, shouldBlur]);

    function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
        handleChangesMade(true);
        const files = e.target.files;
        if(!files){
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const img = new Image();
            img.src = event.target!.result as string;
            setShouldBlur(false)
            setImage(img);
        });
        reader.readAsDataURL(files[0]);
    }

    function handleBlurChange(e: ChangeEvent<HTMLInputElement>) {
        handleChangesMade(true);
        setImage(null);
        setShouldBlur(e.target.checked)
    }

    return (
        <div className={"settings-view"}>
            <div className={"video-effects"}>
                <h2 className={"modal--title"}>Video Effects</h2>
                <div className={"video-preview-container"}>
                    <div className={"video-preview-wrapper"}>
                        <video className={"video-preview"} ref={videoRef}/>
                    </div>
                </div>
                <label><input type={"checkbox"} onChange={handleBlurChange} checked={shouldBlur}/> Blur</label>
                <input type={"file"}  accept={"image/png, image/jpeg"} onChange={handleFileUpload}/>
            </div>
        </div>
    );
}

export default VideoEffects;
