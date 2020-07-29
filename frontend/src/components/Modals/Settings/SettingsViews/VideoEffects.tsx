import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {ISettingsPanelProps} from '../SettingsViewer';
import './VideoEffects.css';
import StreamEffectStore from "../../../../stores/StreamEffectStore";
import HardwareService from "../../../../services/HardwareService";
import CameraStreamEffectsRunner from "../../../../util/CameraStreamEffectsRunner";

const VideoEffects: React.FunctionComponent<ISettingsPanelProps> = ({events, changesMade, handleChangesMade}) => {
    const [shouldBlur, setShouldBlur] = useState(StreamEffectStore.blurBackground);
    const [image, setImage] = useState<HTMLImageElement | null>( null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraStreamEffectsRunner = useRef<CameraStreamEffectsRunner>();

    useEffect(() => {
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
                        videoRef.current!.play();
                    })
            } else if(image) {
                HardwareService.getRawStream("camera")
                    .then((stream: MediaStream) => CameraStreamEffectsRunner.create(stream, false, image))
                    .then((cameraRunner) => {
                        cameraStreamEffectsRunner.current = cameraRunner;
                        videoRef.current!.srcObject = cameraRunner.getStream();
                        videoRef.current!.play();
                    });
            } else {
                HardwareService.getRawStream("camera").then((stream) => {
                    videoRef.current!.srcObject = stream;
                    videoRef.current!.play();
                });
            }
        }
    }, [shouldBlur, image]);

    function onSave(cb: () => void) {

    }

    function onCancel(cb: () => void) {
        if (cameraStreamEffectsRunner.current) {
            cameraStreamEffectsRunner.current.cancel();
        }
    }

    useEffect(() => {
        events.on("save", onSave);
        events.on("cancel", onCancel);
        return () => {
            events.removeListener("save", onSave)
            events.removeListener("cancel", onSave)
        };
    }, [events]);

    function checkChanges() {

    }

    function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
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


    return (
        <div className={"settings-view"}>
            <div className={"video-effects"}>
                <h2 className={"modal--title"}>Video Effects</h2>
                <div className={"video-preview-container"}>
                    <div className={"video-preview-wrapper"}>
                        <video className={"video-preview"} ref={videoRef}/>
                    </div>
                </div>
                <label><input type={"checkbox"} onChange={(e) => {
                    setImage(null);
                    setShouldBlur(e.target.checked)
                }} checked={shouldBlur}/> Blur</label>
                <input type={"file"}  accept={"image/png, image/jpeg"} onChange={handleFileUpload}/>
            </div>
        </div>
    );
}

export default VideoEffects;
