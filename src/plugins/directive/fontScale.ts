import { DirectiveBinding, nextTick } from "vue";

const setFontSize = async (el: HTMLElement, fontSize: number) => {
    const height = el.clientHeight;
    const scrollHeight = el.scrollHeight;
    if (height < scrollHeight) {
        if (fontSize === 16) {
            // 如果字体已经是16将不在缩小，这是采用省略
            el.style.overflow = "hidden";
            el.style.webkitLineClamp = "3";
            el.style.webkitBoxOrient = "vertical";
            el.style.display = "-webkit-box";
            el.style.textOverflow = "ellipsis";
            return;
        }
        el.style.fontSize = fontSize - 2 + "px";
        await nextTick();
        setFontSize(el, fontSize - 2);
    }
};

const FontScaleDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        setFontSize(el, binding.value);
    },

    unmounted() {
        // console.log(el);
    }
};

export default FontScaleDirective;
