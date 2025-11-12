<template>
    <Teleport to="body">
        <div
            ref="panelRef"
            class="dev-shortcuts"
            :class="{
                'is-collapsed': isCollapsed,
                'is-snapping': isSnapping,
                'is-adjusting': isAdjusting,
            }"
            :style="{
                left: position.x + 'px',
                top: position.y + 'px',
                transition: isSnapping
                    ? 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'none',
                opacity: isAdjusting ? 0 : 1,
            }"
        >
            <!-- 收起狀態：齒輪圖示 -->
            <div
                v-if="isCollapsed"
                class="dev-shortcuts-icon"
                @mousedown="handleMouseDown"
            >
                <svg class="gear-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"
                    />
                </svg>
            </div>

            <!-- 展開狀態 -->
            <template v-else>
                <!-- 拖曳手柄 -->
                <div class="dev-shortcuts-handle" @mousedown="handleMouseDown">
                    <span class="drag-icon">⋮⋮</span>
                    <span class="dev-shortcuts-label">開發工具</span>
                </div>

                <!-- 關閉按鈕 -->
                <button class="dev-shortcuts-toggle" @click.stop="closePanel">
                    <svg
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        />
                    </svg>
                </button>

                <!-- 內容區 -->
                <div class="dev-shortcuts-content">
                    <div class="dev-shortcuts-header">
                        <h5 class="dev-shortcuts-title">🚀 開發用捷徑</h5>
                        <button
                            class="btn-change-bg"
                            @click="$emit('toggle-bg')"
                        >
                            換色
                        </button>
                    </div>

                    <!-- 前台區塊 -->
                    <div class="dev-section">
                        <h6 class="dev-section-title">前台</h6>
                        <div class="dev-links">
                            <router-link
                                v-for="link in frontendLinks"
                                :key="link.to"
                                :to="link.to"
                            >
                                {{ link.label }}
                            </router-link>
                        </div>
                    </div>

                    <!-- 後台區塊 -->
                    <div class="dev-section">
                        <h6 class="dev-section-title">後台管理</h6>
                        <div class="dev-links">
                            <router-link
                                v-for="link in adminLinks"
                                :key="link.to"
                                :to="link.to"
                            >
                                {{ link.label }}
                            </router-link>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { debounce } from "lodash-es";

// 路由
import propertyDevLinksF from "@/frontend/property/devLinks.js";

defineEmits(["toggle-bg"]);

// 路由配置
const frontendLinks = [...propertyDevLinksF];

const adminLinks = [
    // { to: "/admin-login2", label: "後台登入" },
    // { to: "/admin2", label: "首頁" },
    // { to: "/admin2/memberlist2", label: "會員列表" },
    // { to: "/admin2/orders2", label: "訂單管理" },
    // { to: "/admin2/coupons2", label: "優惠券管理" },
    // { to: "/admin2/products2", label: "商品管理" },
];

// 基本狀態
const isCollapsed = ref(true);
const token = ref("");
const ID = ref("");
const orderId = ref("");

// 拖曳狀態
const isSnapping = ref(false);
const isAdjusting = ref(false);
const position = ref({ x: 20, y: 20 });
const collapsedPosition = ref(null);

// 元素引用
const panelRef = ref(null);

// 拖曳相關變量
let dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    startTime: 0,
    hasMoved: false,
    animationFrame: null,
};

// 常量
const EDGE_MARGIN = 7;
const CLICK_THRESHOLD = 200;
const MOVE_THRESHOLD = 5;
const PANEL_WIDTH = 500; // 固定寬度
const SCROLLBAR_WIDTH = 17; // 卷軸寬度（預留空間）

// 獲取可用的視窗寬度（扣除卷軸）
const getAvailableWidth = () => {
    const hasVerticalScrollbar =
        document.documentElement.scrollHeight > window.innerHeight;
    return window.innerWidth - (hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0);
};

// 獲取可用的視窗高度（扣除卷軸）
const getAvailableHeight = () => {
    const hasHorizontalScrollbar =
        document.documentElement.scrollWidth > window.innerWidth;
    return window.innerHeight - (hasHorizontalScrollbar ? SCROLLBAR_WIDTH : 0);
};

// ==================== 拖曳相關函數 ====================

const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const panel = panelRef.value;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();

    dragState.isDragging = true;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    dragState.startTime = Date.now();
    dragState.hasMoved = false;

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
};

const handleMouseMove = (event) => {
    if (!dragState.isDragging) return;

    event.preventDefault();

    if (!dragState.hasMoved) {
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > MOVE_THRESHOLD) {
            dragState.hasMoved = true;
        } else {
            return;
        }
    }

    if (dragState.animationFrame) {
        cancelAnimationFrame(dragState.animationFrame);
    }

    dragState.animationFrame = requestAnimationFrame(() => {
        updatePosition(event.clientX, event.clientY);
    });
};

const updatePosition = (clientX, clientY) => {
    const panel = panelRef.value;
    if (!panel) return;

    const newX = clientX - dragState.offsetX;
    const newY = clientY - dragState.offsetY;

    const rect = panel.getBoundingClientRect();
    const availableWidth = getAvailableWidth();
    const availableHeight = getAvailableHeight();

    // ✅ 修正：加上 EDGE_MARGIN
    const maxX = availableWidth - rect.width - EDGE_MARGIN; // 右邊留白
    const maxY = availableHeight - rect.height - EDGE_MARGIN; // 下邊留白

    position.value = {
        x: Math.max(EDGE_MARGIN, Math.min(newX, maxX)), // 左邊留白
        y: Math.max(EDGE_MARGIN, Math.min(newY, maxY)), // 上邊留白
    };
};

const handleMouseUp = (event) => {
    if (!dragState.isDragging) return;

    if (dragState.animationFrame) {
        cancelAnimationFrame(dragState.animationFrame);
        dragState.animationFrame = null;
    }

    const dragDuration = Date.now() - dragState.startTime;
    const wasDragging = dragState.hasMoved;

    dragState.isDragging = false;

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    if (!wasDragging && dragDuration < CLICK_THRESHOLD) {
        if (isCollapsed.value) {
            openPanel();
        }
        return;
    }

    if (wasDragging) {
        setTimeout(() => {
            snapToNearestEdge();
            savePosition();
        }, 0);
    }
};

// ==================== 吸附相關函數 ====================

// 只吸附到左右兩側，不考慮上下
const snapToNearestEdge = () => {
    if (!panelRef.value) return;

    const rect = panelRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const availableWidth = getAvailableWidth();

    // 計算到左右兩邊的距離
    const distanceToLeft = centerX;
    const distanceToRight = availableWidth - centerX;

    let newX = position.value.x;
    const newY = position.value.y; // Y 軸保持不變

    // 吸附到最近的左右邊
    if (distanceToLeft < distanceToRight) {
        // 吸附到左邊
        newX = EDGE_MARGIN;
    } else {
        // 吸附到右邊（考慮卷軸）
        newX = availableWidth - rect.width - EDGE_MARGIN;
    }

    isSnapping.value = true;
    position.value = { x: newX, y: newY };

    setTimeout(() => {
        isSnapping.value = false;
    }, 300);
};

// 計算展開後的安全位置
const calculateSafeExpandedPosition = (currentPos) => {
    let newX = currentPos.x;
    let newY = currentPos.y;

    const availableWidth = getAvailableWidth();
    const availableHeight = getAvailableHeight();

    // 檢查右邊界（考慮卷軸）
    if (newX + PANEL_WIDTH > availableWidth) {
        newX = availableWidth - PANEL_WIDTH - EDGE_MARGIN;
    }

    // 檢查下邊界（考慮卷軸）
    const estimatedHeight = 400; // 預估高度
    if (newY + estimatedHeight > availableHeight) {
        newY = availableHeight - estimatedHeight - EDGE_MARGIN;
    }

    // 檢查左邊界
    if (newX < 0) {
        newX = EDGE_MARGIN;
    }

    // 檢查上邊界
    if (newY < 0) {
        newY = EDGE_MARGIN;
    }

    return { x: newX, y: newY };
};

const adjustPositionDebounced = debounce(() => {
    if (!panelRef.value) return;

    const rect = panelRef.value.getBoundingClientRect();
    const availableWidth = getAvailableWidth();
    const availableHeight = getAvailableHeight();

    let newX = position.value.x;
    let newY = position.value.y;
    let adjusted = false;

    // 檢查右邊界（考慮卷軸）
    if (rect.right > availableWidth) {
        newX = availableWidth - rect.width - EDGE_MARGIN;
        adjusted = true;
    }

    // 檢查左邊界
    if (rect.left < 0) {
        newX = EDGE_MARGIN;
        adjusted = true;
    }

    // 檢查下邊界（考慮卷軸）
    if (rect.bottom > availableHeight) {
        newY = availableHeight - rect.height - EDGE_MARGIN;
        adjusted = true;
    }

    // 檢查上邊界
    if (rect.top < 0) {
        newY = EDGE_MARGIN;
        adjusted = true;
    }

    if (adjusted) {
        position.value = { x: newX, y: newY };
        savePosition();
    }
}, 300);

// ==================== 面板控制 ====================

const openPanel = async () => {
    collapsedPosition.value = { ...position.value };

    const safePosition = calculateSafeExpandedPosition(position.value);
    position.value = safePosition;

    isAdjusting.value = true;
    isCollapsed.value = false;

    await nextTick();

    if (panelRef.value) {
        const rect = panelRef.value.getBoundingClientRect();
        const availableWidth = getAvailableWidth();
        const availableHeight = getAvailableHeight();

        let finalX = position.value.x;
        let finalY = position.value.y;

        if (rect.right > availableWidth) {
            finalX = availableWidth - rect.width - EDGE_MARGIN;
        }
        if (rect.bottom > availableHeight) {
            finalY = availableHeight - rect.height - EDGE_MARGIN;
        }

        position.value = { x: finalX, y: finalY };
    }

    await nextTick();
    isAdjusting.value = false;
};

const closePanel = async () => {
    isCollapsed.value = true;

    await nextTick();

    if (collapsedPosition.value) {
        position.value = { ...collapsedPosition.value };
    }

    setTimeout(() => {
        adjustPositionDebounced();
    }, 50);

    savePosition();
};

const handleClickOutside = debounce((event) => {
    if (
        !isCollapsed.value &&
        panelRef.value &&
        !panelRef.value.contains(event.target)
    ) {
        closePanel();
    }
}, 100);

// ==================== 儲存與載入 ====================

const savePosition = () => {
    localStorage.setItem(
        "dev-shortcuts-position",
        JSON.stringify(position.value)
    );

    if (isCollapsed.value && collapsedPosition.value) {
        localStorage.setItem(
            "dev-shortcuts-collapsed-position",
            JSON.stringify(collapsedPosition.value)
        );
    }
};

const loadPosition = () => {
    const savedPosition = localStorage.getItem("dev-shortcuts-position");
    if (savedPosition) {
        try {
            position.value = JSON.parse(savedPosition);
        } catch (e) {
            console.error("載入位置失敗:", e);
        }
    }

    const savedCollapsedPosition = localStorage.getItem(
        "dev-shortcuts-collapsed-position"
    );
    if (savedCollapsedPosition) {
        try {
            collapsedPosition.value = JSON.parse(savedCollapsedPosition);
        } catch (e) {
            console.error("載入收起位置失敗:", e);
        }
    }
};

// ==================== 生命週期 ====================

onMounted(() => {
    loadPosition();

    nextTick(() => {
        setTimeout(() => {
            adjustPositionDebounced();
        }, 100);
    });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", adjustPositionDebounced);
});

onUnmounted(() => {
    if (dragState.animationFrame) {
        cancelAnimationFrame(dragState.animationFrame);
    }

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", adjustPositionDebounced);

    adjustPositionDebounced.cancel();
    handleClickOutside.cancel();
});
</script>

<style scoped>
.dev-shortcuts {
    position: fixed;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 9998;
    overflow: hidden;
    transition: opacity 0.15s ease;
}

/* 展開狀態：固定寬度 500px */
.dev-shortcuts:not(.is-collapsed) {
    width: 500px;
    max-height: 90vh;
}

.dev-shortcuts.is-adjusting {
    pointer-events: none;
}

.dev-shortcuts.is-collapsed {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dev-shortcuts.is-collapsed:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.dev-shortcuts.is-collapsed:active {
    cursor: grabbing;
}

.dev-shortcuts-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.gear-icon {
    width: 28px;
    height: 28px;
    color: white;
    animation: rotate 20s linear infinite;
    pointer-events: none;
}

.dev-shortcuts.is-collapsed:hover .gear-icon {
    animation: rotate 2s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.dev-shortcuts-handle {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 20px;
    cursor: grab;
    display: flex;
    align-items: center;
    gap: 10px;
    user-select: none;
}

.dev-shortcuts-handle:active {
    cursor: grabbing;
}

.drag-icon {
    font-size: 20px;
    font-weight: bold;
    opacity: 0.9;
    pointer-events: none;
}

.dev-shortcuts-label {
    font-size: 14px;
    font-weight: 600;
    flex: 1;
    pointer-events: none;
}

.dev-shortcuts-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.3);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    z-index: 10;
}

.dev-shortcuts-toggle:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
}

.dev-shortcuts-toggle svg {
    width: 18px;
    height: 18px;
}

.dev-shortcuts-content {
    padding: 16px;
    width: 100%; /* 使用父元素的固定寬度 */
    max-height: calc(90vh - 55px);
    overflow-y: auto;
    cursor: default;
    box-sizing: border-box;
}

.dev-shortcuts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;
}

.dev-shortcuts-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
}

.btn-change-bg {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-change-bg:hover {
    background: #059669;
    transform: translateY(-1px);
}

.dev-section {
    margin-bottom: 16px;
}

.dev-section:last-child {
    margin-bottom: 0;
}

.dev-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    margin: 0 0 10px 0;
    padding-left: 8px;
    border-left: 3px solid #667eea;
}

.dev-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.dev-links a {
    display: inline-block;
    padding: 5px 10px;
    background: #f3f4f6;
    color: #374151;
    text-decoration: none;
    border-radius: 6px;
    font-size: 12px;
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
}

.dev-links a:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.dev-links a.router-link-active {
    background: #667eea;
    color: white;
    font-weight: 600;
}

.dev-input-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: #f9fafb;
    padding: 4px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}

.dev-input {
    padding: 5px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    width: 80px;
    outline: none;
    transition: all 0.2s;
}

.dev-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dev-input-sm {
    width: 50px;
}

.dev-shortcuts-content::-webkit-scrollbar {
    width: 6px;
}

.dev-shortcuts-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.dev-shortcuts-content::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 10px;
}

.dev-shortcuts-content::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
}

@media (max-width: 768px) {
    .dev-shortcuts:not(.is-collapsed) {
        width: calc(100vw - 40px);
        max-width: 500px;
    }

    .dev-links {
        gap: 4px;
    }

    .dev-links a {
        font-size: 11px;
        padding: 4px 8px;
    }

    .dev-section-title {
        font-size: 12px;
    }
}
</style>
