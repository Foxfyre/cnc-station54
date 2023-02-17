/*Hooks.on("init", () => {
    game.settings.register("coyote-and-crow", "initialized", {
        name: "Initialization",
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.registerMenu("coyote-and-crow", "init-dialogue", {
        name: "Coyote & Crow - Encounter at Station 54",
        label: "Setup",
        hint: "Import or update the content from the Coyote and Crow Introductory adventure - Encounter at Station 54",
        type: CNCE54InitWrapper,
        restricted: true
    })
})

Hooks.on("ready", () => {
    if (!game.settings.get("coyote-and-crow", "initialized") && game.user.isGM) {
        new CNCE54Initialization().render(true)
    }
})

class CNCE54InitWrapper extends FormApplication {
    render() {
        new CNCE54Initialization().render(true);
    }
}

class CNCE54Initialization extends Dialog {
    constructor() {
        super({
            title: "Coyote & Crow Encounter at Station 54 Initialization",
            content: `            
            <b>Initialize Module to import all content?</b></div>
            `,
            module: game.modules.get("cnc-station54"),
            buttons: {
                initialize: {
                    label: "Initialize",
                    callback: async () => {
                        game.settings.set("coyote-and-crow", "initialized", true)
                        await new CNCE54Initialization().initialize()
                        ui.notifications.notify("Initialization Complete")
                    }
                },
                /*update: {
                    label: "Update",
                    callback: async () => {
                        let updater = await game.the - CNCE54Initialization.apps.ModuleUpdater.create(game.modules.get("cnc-core"), this)
                        updater.render(true)
                    }
                },*/
                /*no: {
                    label: "No",
                    callback: () => {
                        game.settings.set("coyote-and-crow", "initialized", true)
                        ui.notifications.notify("Skipped Initialization.")
                    }
                }
            }
        })

        this.folders = {
            "Scene": {},
            "Item": {},
            "Actor": {},
            "JournalEntry": {}
        }

        this.journals = {};
        this.actors = {};
        this.items = {};
        this.scenePacks = [];
        this.moduleKey = "cnc-station54";
        this.systemKey = "coyote-and-crow";
    }

    async initialize() {
        return new Promise((resolve) => {
            fetch(`modules/${this.moduleKey}/initialization.json`).then(async r => r.json()).then(async json => {
                let createdFolders = await Folder.create(json)
                for (let folder of createdFolders)
                    this.folders[folder.type][folder.name] = folder;

                for (let folderType in this.folders) {
                    for (let folder in this.folders[folderType]) {

                        let parent = this.folders[folderType][folder].getFlag(this.systemKey, "initialization-parent") // changed from moduleKey to systemKey
                        if (parent) {
                            let parentId = this.folders[folderType][parent].id
                            await this.folders[folderType][folder].update({ parent: parentId })
                        }
                    }
                }

                await this.initializeDocuments()
                /* This need's to be turned on when scenes are present */
                /*await this.initializeScenes()
                resolve()

            })
        })
    }

    async initializeDocuments() {
        console.log(this.data)

        let packList = this.data.module.flags.initializationPacks

        console.log(packList);

        for (let pack of packList) {
            console.log(pack);
            if (game.packs.get(pack).metadata.type == "Scene") {
                this.scenePacks.push(pack)
                continue
            }

            let documents = await game.packs.get(pack).getDocuments();
            console.log(documents);
            for (let document of documents) {
                console.log(document);

                let folder = document.getFlag(this.systemKey, "initialization-folder")
                console.log(folder);

                if (folder)
                    document.updateSource({ "folder": this.folders[document.documentName][folder].id })

                if (document.getFlag(this.systemKey, "sort"))
                    document.updateSource({ "sort": document.flags[this.systemKey].sort })
            }
            try {
                switch (documents[0].documentName) {
                    case "Actor":
                        ui.notifications.notify(this.data.module.title + ": Initializing Actors")
                        await this.createOrUpdateDocuments(documents, game.actors)
                        break;
                    case "Item":
                        ui.notifications.notify(this.data.module.title + ": Initializing Items")
                        await this.createOrUpdateDocuments(documents, game.items)
                        break;
                    case "JournalEntry":
                        ui.notifications.notify(this.data.module.title + ": Initializing Journals")
                        await this.createOrUpdateDocuments(documents, game.journal)
                        break;
                    case "RollTable":
                        ui.notifications.notify(this.data.module.title + ": Initializing Tables")
                        await this.createOrUpdateDocuments(documents, game.tables)
                        break;
                }
            }
            catch(e)
            {
                console.error(e);
            }
        }
    }

    async createOrUpdateDocuments(documents, collection, ) {
        let existingDocuments = documents.filter(i => collection.has(i.id)) 
        let newDocuments = documents.filter(i => !collection.has(i.id))
        await collection.documentClass.create(newDocuments)
        for (let doc of existingDocuments) {
            let existing = collection.get(doc.id)
            await existing.update(doc.toObject())
            ui.notifications.notify(`Updated existing document ${doc.name}`)
        }
    }

    /*This need's to be turned on when there are scenes to import */
    /*async initializeScenes() {
        ui.notifications.notify(this.data.module.title + ": Initializing Scenes")
        let m = game.packs.get(`${this.moduleKey}.encounter-at-station-54-scenes`)
        let maps = await m.getDocuments()
        for (let map of maps) {
            let folder = map.getFlag(this.moduleKey, "initialization-folder") // changed from moduleKey to systemKey
            if (folder)
                map.updateSource({ "folder": this.folders["Scene"][folder].id })
        }
        await Scene.create(maps).then(sceneArray => {
            sceneArray.forEach(async s => {
                let thumb = await s.createThumbnail();
                s.update({ "thumb": thumb.thumb })
            })
        })
    }
}

// run CNCE54InitializationSetup.setup() in the console

class CNCE54InitializationSetup {
    static async setup() {
        CNCE54InitializationSetup.displayFolders();
        CNCE54InitializationSetup.setFolderFlags();
        CNCE54InitializationSetup.setSceneNotes();
        CNCE54InitializationSetup.setEmbeddedEntities();
    }

    static async displayFolders() {
        let array = [];
        console.log(game.folders)
        game.folders.forEach(async f => {
            if (f.parent)
                await f.setFlag("cnc-station54", "initialization-parent", game.folders.get(f.parent).name)
        })
        game.folders.forEach(f => {
            array.push(f);
        })
        console.log(JSON.stringify(array))
    }

    static async setFolderFlags() {
        for (let scene of game.scenes)
            await scene.update({ "flags.cnc-station54": { "initialization-folder": game.folders.get(scene.folder).name, "sort": scene.sort } })
        for (let actor of game.actors)
            await actor.update({ "flags.cnc-station54": { "initialization-folder": game.folders.get(actor.folder).name, "sort": actor.sort } })
        for (let item of game.items)
            await item.update({ "flags.cnc-station54": { "initialization-folder": game.folders.get(item.data.folder).data.name, "sort": item.sort } })
        for (let journal of game.journal)
            await journal.update({ "flags.cnc-station54": { "initialization-folder": game.folders.get(journal.folder)?.name, "sort": journal.sort } })
    }

    static async setSceneNotes() {
        for (let scene of game.scenes)
            if (scene.journal)
                await scene.setFlag("cnc-station54", "scene-notes", game.journal.get(scene.journal).name)
    }

    static async setEmbeddedEntities() {
        for (let scene of game.scenes) {
            let notes = duplicate(scene.notes)
            for (let note of notes) {
                setProperty(note, "flags.cnc-station54.initialization-entryname", game.journal.get(note.entryId).name)
            }
            await scene.update({ notes: notes })
        }
    }
}*/