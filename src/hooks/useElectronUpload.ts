export default () => {
    const filterMap = new Map();
    filterMap.set("image", [{
        name: "image",
        extensions: ["png", "jpg", "jpeg", "bmp", "gif"]
    }]);
    filterMap.set("audio", [{
        name: "audio",
        extensions: ["mp3"]
    }]);
    filterMap.set("video", [{
        name: "video",
        extensions: ["mp4"]
    }]);
    const properties = (process as any).platform === "darwin" ? ["openFile", "openDirectory"] : ["openFile"];

    const uploadByElectron = (type: string, callback: (file: File, buffer: ArrayBuffer) => void) => {
        window.electron.remote.dialog.showOpenDialog({
            title: "选择上传文件",
            buttonLabel: "确定",
            filters: filterMap.get(type),
            properties: [...properties, ...(type === "image" ? ["multiSelections"] : [])]
        }).then((file: any) => {
            if (!file.canceled) {
                for (let i = 0; i < file.filePaths.length; i++) {
                    const path = file.filePaths[i];
                    window.electron.readFile(path, (buffer: ArrayBuffer) => {
                        const fileName = path.replace(/(.*\/)*([^.]+)/i, "$2");
                        const newFile = new File([buffer], fileName);
                        callback(newFile, buffer);
                    });
                }
            }
        }).catch((err: any) => {
            if (window.electron && window.electron.log) {
                window.electron.log.error(err);
            }
        });
    };

    return {
        uploadByElectron
    };
};
