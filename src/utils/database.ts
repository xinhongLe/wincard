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
