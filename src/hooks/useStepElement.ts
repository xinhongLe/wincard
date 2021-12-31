import { MutationTypes, useStore } from "@/store";

export default () => {
    const store = useStore();
    const setElementStep = () => {
        store.commit(MutationTypes.SET_STEP_DIALOG, true);
    };

    return {
        setElementStep
    };
};
