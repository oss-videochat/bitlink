import {MesssgeType} from '@bitlink/common';

export interface Message {
    id: string,
    content: string,
    created: Date,
    type: MesssgeType
}
