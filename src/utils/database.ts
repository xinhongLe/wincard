import Dexie from "dexie";
import { Slide } from "@/types/slides";

export interface Snapshot {
    index: number;
    slides: Slide[];
}

class SnapshotDatabase extends Dexie {
    public snapshots: Dexie.Table<Snapshot, number>;

    public constructor() {
        super("SnapshotDatabase");
        this.version(1).stores({
            snapshots: "++id"
        });
        this.snapshots = this.table("snapshots");
    }
}

let snapshotDB = new SnapshotDatabase();

export const getSnapshotDB = () => {
    return snapshotDB;
};

export const destorySnapshotDB = () => {
    snapshotDB.delete();
    snapshotDB = new SnapshotDatabase();
};

export interface WinCardResourceData {
    id: string;
    resource: string;
}

class WinCardResourceDatabase extends Dexie {
    public db: Dexie.Table<WinCardResourceData, number>;

    public constructor() {
        super("WinCardResourceDatabase");
        this.version(1).stores({
            wnCardResource: "id,resource"
        });
        this.db = this.table("wnCardResource");
    }
}

let windCardResourceDB = new WinCardResourceDatabase();

export const getResourceDB = () => {
    return windCardResourceDB;
};

export const destoryResourceDB = () => {
    windCardResourceDB.delete();
    windCardResourceDB = new WinCardResourceDatabase();
};
