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
        (window as any).electron.remote.dialog.showOpenDialog({
            title: "选择上传文件",
            buttonLabel: "确定",
            filters: filterMap.get(type),
            properties: properties
        }).then((file: any) => {
            if (!file.canceled) {
                const path = file.filePaths[0];
                (window as any).electron.readFile(path, (buffer: ArrayBuffer) => {
                    const fileName = path.replace(/(.*\/)*([^.]+)/i, "$2");
                    const newFile = new File([buffer], fileName);
                    callback(newFile, buffer);
                });
            }
        }).catch((err: any) => {
            if ((window as any).electron && (window as any).electron.log) {
                (window as any).electron.log.error(err);
            }
        });
    };

    return {
        uploadByElectron
    };
};
