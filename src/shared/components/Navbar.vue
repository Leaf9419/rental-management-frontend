<template>
    <nav class="navbar">
        <!-- 上方導覽列 -->
        <div class="navbar-top">
            <ul class="navbar-right">
                <li>
                    <RouterLink to="/announcement">最新公告</RouterLink>
                </li>
                <li>
                    <RouterLink to="/help">幫助中心</RouterLink>
                </li>
                <li>
                    <RouterLink to="/auth/login">登入</RouterLink>
                </li>
                <li>
                    <RouterLink to="/auth/register">註冊</RouterLink>
                </li>
            </ul>
        </div>

        <!-- 下方主選單 -->
        <div class="navbar-main">
            <ul class="navbar-menu">
                <li class="dropdown">
                    <a href="#">找房源</a>
                    <!--
                    可在這裡加子選單項目，例如:
                    <ul class="dropdown-menu">
                        <li>
                            <RouterLink to="/property">所有房源</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/property/map">地圖搜尋</RouterLink>
                        </li>
                    </ul>
                    -->
                </li>

                <li class="dropdown">
                    <a href="#">我要出租</a>
                    <!--
                    可在這裡加子選單項目，例如:
                    <ul class="dropdown-menu">
                        <li>
                            <RouterLink to="/landlord/add">刊登房源</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/landlord/manage">管理房源</RouterLink>
                        </li>
                    </ul>
                    -->
                </li>

                <li class="dropdown">
                    <a href="#">我的租屋</a>
                    <!--
                    可在這裡加子選單項目，例如:
                    <ul class="dropdown-menu">
                        <li>
                            <RouterLink to="/tenant/bookings">我的預約</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/tenant/contracts">我的租約</RouterLink>
                        </li>
                    </ul>
                    -->
                </li>

                <li>
                    <RouterLink to="/admin">管理員後台</RouterLink>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="less">
.navbar {
    width: 100%;
    line-height: 1;
}

/* === 上方導覽列 === */
.navbar-top {
    background-color: #242424;
    padding: 3px 40px;
    display: flex;
    justify-content: flex-end;
}

.navbar-right {
    list-style: none;
    display: flex;
    gap: 20px;

    li {
        a {
            color: white;
            font-size: 14px;
        }
    }
}

/* === 下方主選單 === */
.navbar-main {
    background-color: #fafafa;
    padding: 8px 0;
}

.navbar-menu {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 200px;

    li {
        position: relative;

        a {
            color: #000;
            font-size: 16px;
            padding: 8px 0;
            display: inline-block;
        }

        &.dropdown {
            padding-bottom: 5px;
        }

        &.dropdown:hover {
            .dropdown-menu {
                display: block;
                animation: fadeIn 0.2s ease-out;
            }
        }
    }
}

/* === 子選單 === */
.dropdown-menu {
    position: absolute;
    top: calc(100% + 0px);
    left: 0;
    background: white;
    border: 1px solid #ddd;
    display: none;
    list-style: none;
    min-width: 140px;
    padding: 8px 0;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);

    li {
        padding: 8px 20px;

        a {
            color: black;
            display: block;
            transition: background-color 0.2s;

            &:hover {
                background-color: #eee;
            }
        }
    }
}

/* === 下拉選單淡入動畫 === */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>