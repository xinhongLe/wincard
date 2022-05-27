/**
 * @param content
 * @param eventType
 */
export const logInput = (content: string, eventType: number, option?: string) => {
    console.log(content, eventType, option);
};

export const writeLog = (content: string, eventType: number, pageId: string, pageName: string, option?: string) => {
    console.log(content, eventType, pageId, pageName, option);
};

export const enum LOG_EVENT {
    SELECT_SUBJECT_BOOK = 0, // 选择书本
    SELECT_UNIT = 1, // 选择单元
    SELECT_WINDOW = 2, // 选择窗
    SELECT_PAGE = 3, // 选择页
    CLICK_ADD_CARD = 4, // 点击新增卡
    SAVE_ADD_CARD = 5, // 新增卡保存
    CLICK_PREVIEW_CARD = 6, // 点击预览卡
    CLICK_ADD_PAGE = 7, // 点击新增页
    SAVE_ADD_PAGE = 8, // 新增页保存
    CLICK_CHANGE_CARD_NAME = 9, // 点击修改卡名称
    SAVE_CHANGE_CARD_NAME = 10, // 修改卡名称保存
    CLICK_DELETE_CARD = 11, // 点击删除卡
    SURE_DELETE_CARD = 12, // 确认删除卡
    CLICK_CHANGE_PAGE_NAME = 13, // 点击修改页名称
    SAVE_CHANGE_PAGE_NAME = 14, // 修改页名称保存
    CLICK_PAGE_ON = 15, // 点击页面上架
    SURE_PAGE_NO = 16, // 确认页面上架
    CLICK_PAGE_OFF = 17, // 点击页面下架
    SURE_PAGE_OFF = 18, // 确认页面下架
    CLICK_DELETE_PAGE = 19, // 点击删除页面
    SURE_DELETE_PAGE = 20, // 确认删除页面
    CLICK_PREVIEW_PAGE = 21, // 点击预览页面
    CLICK_SAVE_DATA = 22, // 点击保存页面
    CLICK_ADD_STEP = 23, // 点击新增步骤
    CLICK_STEP_ADD_ACTION = 24, // 点击步骤新增时间
    SAVE_STEP_ACTION = 25, // 保存步骤事件
    CLICK_ELEMENT_OPEN_CARD = 26, // 点击元素新增弹卡
    SAVE_ELEMENT_OPEN_CARD = 27, // 新增弹卡保存
    CLICK_ELEMENT_ADD_ACTION = 28, // 点击元素新增事件
    SAVE_ELEMENT_ADD_ACTION = 29, // 元素新增事件保存
    CLICK_ELEMENT_EDIT_ACTION = 30, // 点击元素编辑事件
    SAVE_ELEMENT_EDIT_ACTION = 31, // 元素编辑事件保存
    DELETE_ELEMENT_ACTION = 32, // 删除元素事件
    ADD_ELEMENT = 33, // 新增元素
    UPDATE_ELEMENT = 34, // 更新元素
    DELETE_ELEMENT = 35, // 删除元素
    SELECT_ELEMENT = 36, // 点击某元素
    SELECT_LIST_ELEMENT = 37, // 元素列表点击选中元素
    DELETE_ELEMENT_FROM_LIST = 38, // 元素列表点击删除元素
    DELETE_ELEMENT_HOT_KEY = 39, // 快捷键删除元素
    CUT_ELEMENT = 40 // 元素剪切
}
