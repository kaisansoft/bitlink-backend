import Participant from "./Participant";
import Reactions from "./enums/Reactions";
import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';

interface Reaction {
    type: Reactions,
    participant: Participant,
}

interface MessageJSONSummary {
    from: string // id of participant
    to: string, // id of participant
    message: string,
    content: string,
    reactions: Array<Reaction>
}

class Message extends Event.EventEmitter {
    public readonly to;
    public readonly id;
    public readonly from;
    public readonly created = new Date();
    public content;
    public isDeleted = false;
    public readonly isToEveryone;
    private readonly reactions: Array<Reaction> = [];

    constructor(from: Participant, to: Participant | string, content: string) {
        super();
        this.to = to;
        this.from = from;
        this.isToEveryone = to === "everyone";
        this.content = content;
        this.id = uuidv4();
    }

    addReaction(from: Participant, type: Reactions) {
        this.reactions.push({
            type,
            participant: from
        });
        this.emit("reaction-change")
    }

    removeReaction(from: Participant, type: Reactions) {
        this.reactions.splice(this.reactions.findIndex(reaction => {
            return reaction.participant.id === from.id && reaction.type === type;
        }, 1));
        this.emit("reaction-change")
    }

    edit(newContent: string) {
        this.content = newContent;
        this.emit("edit");
    }

    delete() {
        this.isDeleted = true;
        this.emit("deleted");
    }

    toJSON(): MessageJSONSummary {
        return {
            from: this.from.id, // id of participant
            to: this.isToEveryone ? "everyone" : this.to.id,
            message: this.id,
            content: this.content,
            reactions: this.reactions
        }
    }

}

export default Message;
