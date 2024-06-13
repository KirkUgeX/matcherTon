import { getAccessToken } from "../services/localStorage";

export class Event {
    stringify() {
        return JSON.stringify(this);
    }
}

export class AuthenticateEvent extends Event {
    constructor() {
        super();
        this.type = "authenticate";
        this.payload = {
            token: getAccessToken()
        };
    }
}

export class MoveEvent extends Event {
    constructor(column) {
        super();
        this.type = "move";
        this.payload = {
            column
        };
    }
}
