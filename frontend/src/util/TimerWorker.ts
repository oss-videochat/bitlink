export enum TimerWorkerMessageType {
    START_TIMER,
    END_TIMER,
    TICK
}

const code = `

var timer;

onmessage = function(request) {
    switch (request.data.type){
        case ${TimerWorkerMessageType.START_TIMER}: {
            timer = setInterval(function (){
                postMessage({type: ${TimerWorkerMessageType.TICK}})
            }, request.data.timeMs);
            break;
        }
        case ${TimerWorkerMessageType.END_TIMER}: {
            if(timer){
                clearInterval(timer);
            }
            break;
        }
        default: {
            throw "Unknown message type"
        }
    }
}
`;
export const timerWorkerScript = URL.createObjectURL(new Blob([code], {type: 'application/javascript'}));
