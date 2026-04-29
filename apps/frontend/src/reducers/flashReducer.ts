import { FlashMessageInterface } from '../types/flash';

export enum FlashReducerActions {
    RESET = 'RESET',
    ADD = 'ADD',
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    SUCCESS = 'SUCCESS',
    INFO = 'INFO',
    REMOVE = 'REMOVE',
}

export interface FlashReducerActionInterface {
    type: FlashReducerActions;
    message?: FlashMessageInterface;
    text?: string;
}

export default function flashReducer(
    messages: FlashMessageInterface[],
    action: FlashReducerActionInterface
): FlashMessageInterface[] {
    switch (action.type) {
        case FlashReducerActions.RESET:
            return [];

        case FlashReducerActions.ADD:
            if (!action.message) {
                throw new Error('No message provided to flashReducer.');
            }
            return [...messages, action.message];

        case FlashReducerActions.ERROR:
        case FlashReducerActions.WARNING:
        case FlashReducerActions.SUCCESS:
        case FlashReducerActions.INFO:
            if (!action.text) {
                throw new Error('No text provided to flashReducer.');
            }

            return [
                ...messages,
                {
                    type: action.type.toLowerCase() as FlashMessageInterface['type'],
                    message: action.text,
                    timestamp: Date.now(),
                },
            ];

        case FlashReducerActions.REMOVE:
            if (!action.message) {
                throw new Error('No message provided to flashReducer.');
            }

            return messages.filter((message) => message !== action.message);

        default:
            throw new Error('Unhandled action ' + action.type + ' in flashReducer.');
    }
}
