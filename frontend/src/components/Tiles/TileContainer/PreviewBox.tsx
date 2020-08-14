import React, { useEffect, useRef } from "react";
import "./PreviewBox.css";
import MyInfo from "../../../stores/MyInfoStore";
import HardwareService from "../../../services/HardwareService";
import { reaction } from "mobx";
import StreamEffectStore from "../../../stores/StreamEffectStore";
import NotificationService from "../../../services/NotificationService";
import { NotificationType } from "../../../enum/NotificationType";

export const PreviewBox: React.FunctionComponent = () => {
  const previewRef = useRef<HTMLVideoElement>(null);

  async function updateMedia() {
    if (!MyInfo.participant?.mediaState.camera || !previewRef.current) {
      return;
    }
    const stream = await HardwareService.getStream("camera");
    const srcObject = previewRef.current.srcObject as MediaStream | undefined;
    if (srcObject?.getVideoTracks()[0].id !== stream.getVideoTracks()[0].id) {
      previewRef.current!.srcObject = stream;
    }
  }

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }

    function play() {
      previewRef.current!.play().catch((e) => {
        NotificationService.add(
          NotificationService.createUINotification(
            `Some error occurred. This shouldn't happen: "${e.toString()}"`,
            NotificationType.Error
          )
        );
      });
    }

    previewRef.current.addEventListener("canplay", play);
    previewRef.current.removeEventListener("canplay", play);
  }, [previewRef]);

  useEffect(() => {
    updateMedia().catch((e) => {
      NotificationService.add(
        NotificationService.createUINotification(
          `Some error occurred. This shouldn't happen: "${e.toString()}"`,
          NotificationType.Error
        )
      );
    });

    return reaction(
      () => ({
        video: MyInfo.preferredInputs.video,
        effectRunner: StreamEffectStore.cameraStreamEffectRunner,
      }),
      updateMedia
    );
  }, []);

  return (
    <div className={"preview-video-wrapper"}>
      <video playsInline={true} muted={true} autoPlay={true} ref={previewRef} />
    </div>
  );
};
