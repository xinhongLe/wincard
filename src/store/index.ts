import { createStore, Store, useStore as baseUseStore } from "vuex";
import { InjectionKey } from "vue";
import { State, state } from "./state";
import { getters } from "./getters";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { MutationTypes, ActionTypes } from "./constants";

export { MutationTypes, ActionTypes };

export const key: InjectionKey<Store<State>> = Symbol("");

export const store = createStore<State>({
    state,
    getters,
    mutations,
    actions
});

export const useStore = () => baseUseStore(key);
