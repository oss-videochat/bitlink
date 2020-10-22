import React, {
    MouseEvent as ReactMouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import "./VolumeSlider.css";
import Participant from "../../../../models/Participant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeDown } from "@fortawesome/free-solid-svg-icons";
import { useObserver } from "mobx-react";
import { TileMenuItem } from "../../TileTypes/Util/TileMenuItem";

interface VolumeSliderProps {
    participant: Participant;
}

export const VolumeSlider: React.FunctionComponent<VolumeSliderProps> = ({ participant }) => {
    const slider = useRef<HTMLSpanElement>(null);
    const [listenToMouse, setListenToMouse] = useState(false);

    const changeVolume = useCallback(
        (e: ReactMouseEvent<HTMLSpanElement> | MouseEvent) => {
            if (!slider.current) {
                return;
            }
            const boundingClientRect = slider.current.getBoundingClientRect();
            participant.volume = Math.min(
                Math.max(
                    Math.round(
                        ((e.clientX - boundingClientRect.left) / boundingClientRect.width) * 100
                    ) / 100,
                    0
                ),
                1
            );
        },
        [slider, participant]
    );

    function handleClick(e: ReactMouseEvent<HTMLSpanElement>) {
        e.nativeEvent.stopImmediatePropagation();
        changeVolume(e);
    }

    function handleMouseDown() {
        setListenToMouse(true);
    }

    function handleMouseUp() {
        setListenToMouse(false);
    }

    useEffect(() => {
        function move(e: MouseEvent) {
            if (!listenToMouse) {
                return;
            }
            changeVolume(e);
        }

        function up(e: MouseEvent) {
            e.stopImmediatePropagation();
            setListenToMouse(false);
        }

        document.addEventListener("mouseup", up);
        document.addEventListener("mousemove", move);

        return () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        };
    }, [changeVolume, listenToMouse]);

    return useObserver(() => (
        <TileMenuItem>
            <span className={"volume-slider"}>
                <FontAwesomeIcon icon={faVolumeDown} />
                <span
                    ref={slider}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onClick={handleClick}
                    className={"volume-slider-wrapper"}
                >
                    <span
                        className={"volume-slider--fill"}
                        style={{ width: participant.volume * 100 + "%" }}
                    >
                        <span className={"volume-slider--button"} />
                    </span>
                </span>
            </span>
        </TileMenuItem>
    ));
};
