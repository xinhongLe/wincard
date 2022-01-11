import isElectron from "is-electron";

const PREFIX = "VUE";

export enum STORAGE_TYPES {
    /**
     * 是否开启缓存
     */
    SET_ISCACHE = "SET_ISCACHE"
}

export const set = (name: STORAGE_TYPES, value: any) => {
    if (isElectron()) {
        (window as any).electron.store.set(`${PREFIX}_${name}`, typeof value === "string" ? value : JSON.stringify(value));
    } else {
        localStorage.setItem(`${PREFIX}_${name}`, typeof value === "string" ? value : JSON.stringify(value));
    }
};

export const get = (name: STORAGE_TYPES) => {
    let item;
    if (isElectron()) {
        item = (window as any).electron.store.get(`${PREFIX}_${name}`);
    } else {
        item = localStorage.getItem(`${PREFIX}_${name}`);
    }
    let result;
    try {
        result = item === null ? null : JSON.parse(item);
    } catch {
        result = item;
    }
    return result;
};

export const remove = (name: string) => {
    if (isElectron()) {
        (window as any).electron.store.delete(`${PREFIX}_${name}`);
    } else {
        localStorage.removeItem(`${PREFIX}_${name}`);
    }
};

export const clear = () => {
    if (isElectron()) {
        (window as any).electron.store.clear();
    } else {
        Object.keys(localStorage).forEach((name) => {
            const REGEXP = /^VUE_(.+)/;

            // 记录账号历史记录的不删除
            if (!REGEXP.test(name)) {
                return;
            }
            remove(name.substring(4));
        });
    }
};
