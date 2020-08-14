import React, { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { ISettingsPanelProps } from "../SettingsViewer";
import "./VideoEffects.css";
import StreamEffectStore from "../../../../stores/StreamEffectStore";
import HardwareService from "../../../../services/HardwareService";
import CameraStreamEffectsRunner from "../../../../util/CameraStreamEffectsRunner";
import StreamEffectService from "../../../../services/StreamEffectService";
import Spinner from "../../../Util/Spinner";
import NotificationService from "../../../../services/NotificationService";
import { NotificationType } from "../../../../enum/NotificationType";

interface IVirtualBackgroundBox {
  text?: string;
  image?: HTMLImageElement;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  selected: boolean;
}

const VirtualBackgroundBox: React.FunctionComponent<IVirtualBackgroundBox> = ({
  text,
  image,
  onClick,
  selected,
}) => (
  <div onClick={onClick} className={"virtual-background-box " + (selected && "selected")}>
    {image && (
      <img data-private={"lipsum"} className={"virtual-background-box__image"} src={image.src} />
    )}
    {text && <span className={"virtual-background-box__text"}>{text}</span>}
  </div>
);

const VideoEffects: React.FunctionComponent<ISettingsPanelProps> = ({
  events,
  changesMade,
  handleChangesMade,
}) => {
  const [shouldBlur, setShouldBlur] = useState(StreamEffectStore.blur);
  const [image, setImage] = useState<HTMLImageElement | null>(StreamEffectStore.image);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const cameraStreamEffectsRunner = useRef<CameraStreamEffectsRunner>();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setVideoReady(false);
    const el = videoRef.current;

    function canplay() {
      setVideoReady(true);
      el!.play().catch((e) => {
        NotificationService.add(
          NotificationService.createUINotification(
            `Some error occurred. This shouldn't happen: "${e.toString()}"`,
            NotificationType.Error
          )
        );
      });
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
          });
      } else if (image) {
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
      el!.addEventListener("canplay", canplay);
      return () => {
        el && el!.removeEventListener("canplay", canplay);
      };
    }
  }, [shouldBlur, image]);

  useEffect(() => {
    function onCancel() {
      if (cameraStreamEffectsRunner.current) {
        cameraStreamEffectsRunner.current.cancel();
      }
    }

    async function onSave(cb: () => void) {
      if (cameraStreamEffectsRunner.current) {
        cameraStreamEffectsRunner.current.cancel();
      }
      if (!shouldBlur && !image) {
        StreamEffectService.endEffects();
        cb();
        return;
      }
      if (shouldBlur) {
        await StreamEffectService.enableBlur();
      }
      if (image) {
        await StreamEffectService.enableVirtualBackground(image);
      }
      cb();
    }

    events.on("save", onSave);
    events.on("cancel", onCancel);
    return () => {
      events.removeListener("save", onSave);
      events.removeListener("cancel", onSave);
    };
  }, [events, image, shouldBlur]);

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    handleChangesMade(true);
    const files = e.target.files;
    if (!files) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const img = new Image();
      img.src = event.target!.result as string;
      setShouldBlur(false);
      setImage(img);
    });
    reader.readAsDataURL(files[0]);
  }

  function handleBlurChange(e: ChangeEvent<HTMLInputElement>) {
    handleChangesMade(true);
    setImage(null);
    setShouldBlur(e.target.checked);
  }

  function handleNoneSelect() {
    handleChangesMade(true);
    if (!image) {
      return;
    }
    setImage(null);
  }

  function handleAddNewImage() {
    if (!fileUploadRef.current) {
      return;
    }
    fileUploadRef.current.click();
  }

  return (
    <div className={"settings-view"}>
      <div className={"video-effects"}>
        <h2 className={"modal--title"}>Video Effects</h2>
        <div className={"video-preview-container"}>
          <div className={"video-preview-wrapper"}>
            {!videoReady && (
              <div className={"video-spinner"}>
                <Spinner size={"40px"} />
              </div>
            )}
            <video
              muted={true}
              playsInline={true}
              className={"video-preview " + (videoReady ? "ready" : "")}
              ref={videoRef}
            />
          </div>
        </div>
        <label>
          <input type={"checkbox"} onChange={handleBlurChange} checked={shouldBlur} /> Blur
        </label>
        <div className={"virtual-background-box-container"}>
          <VirtualBackgroundBox text={"None"} onClick={handleNoneSelect} selected={!image} />
          {image && <VirtualBackgroundBox image={image} selected={true} />}
          <VirtualBackgroundBox text={"New +"} onClick={handleAddNewImage} selected={false} />
          <input
            hidden
            type={"file"}
            accept={"image/png, image/jpeg"}
            ref={fileUploadRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoEffects;
