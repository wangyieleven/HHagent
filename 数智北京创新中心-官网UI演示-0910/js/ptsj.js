document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("platformDataContainer");
    if (!container) {
        console.warn("未找到容器元素 #platformDataContainer");
        return;
    }

    apiService.getNeedQuantity()
        .then(res => {
            console.log('处理后的数据：', res);

            if (res.success && !res.empty && res.data != null) {
                // 构建展示结构
                const dl = document.createElement("dl");

                const dt = document.createElement("dt");
                dt.textContent = "需求发布数";

                const dd = document.createElement("dd");
                dd.innerHTML = `<b>${res.data}</b><font>个</font>`;

                dl.appendChild(dt);
                dl.appendChild(dd);
                container.appendChild(dl);
            } else {
                console.warn("暂无数据展示：", res);
            }
        })
        .catch(err => {
            console.error("请求失败：", err);
        });
});
