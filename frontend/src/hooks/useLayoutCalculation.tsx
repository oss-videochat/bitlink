import { RefObject, useEffect, useState } from "react";
import { reaction } from "mobx";
import UIStore from "../stores/UIStore";
import { LayoutSizeCalculation } from "../util/layout/LayoutSizeCalculation";

export function useLayoutCalculation(
    param1: number | (() => number),
    container: RefObject<HTMLDivElement>
) {
    const [windowSize, setWindowSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    const [flexBasis, setBasis] = useState("0");
    const [maxWidth, setMaxWidth] = useState("0");

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        return reaction(
            () => {
                const numTiles = typeof param1 === "number" ? param1 : param1();

                return {
                    mode: UIStore.store.layout.mode,
                    chatPanel: UIStore.store.chatPanel,
                    numTiles,
                };
            },
            (data) => {
                if (!container.current) {
                    return;
                }
                const divWidth = UIStore.store.chatPanel
                    ? windowSize.width - 450
                    : windowSize.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
                const result = LayoutSizeCalculation(
                    divWidth,
                    container.current.offsetHeight,
                    data.numTiles
                );
                setBasis(result.basis);
                setMaxWidth(result.maxWidth);
            },
            { fireImmediately: true }
        );
    }, [param1, windowSize, container]);

    return { maxWidth, flexBasis };
}
