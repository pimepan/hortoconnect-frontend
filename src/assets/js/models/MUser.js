import config from "../../../config";
export default class {
    constructor({

        uid = "",
        email = "",
        displayName = "",
        photoURL = "",
        description = "",
    } = {}) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.photoURL = photoURL;
        this.description = description;
    }
    get(){}
    set(){}
    update(){}
    delete(){}
    
}