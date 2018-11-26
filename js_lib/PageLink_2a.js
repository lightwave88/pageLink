// 2017/01/19
/* ========================================================================== */
/*
 使用方式
 
 設定
 $PageLink_(dom).set(option);
 
 option: {
 page: // 顯示第幾頁，從第1頁開始
 totalRows: // 資料共有幾筆
 perPageRows: // 每一頁要顯示幾筆資料
 perPageLinks: // 每一頁至多有幾個 pageLink
 }
 
 渲染
 $PageLink_(dom).render()
 
 下一頁
 $PageLink_(dom).nextPage()
 
 上一頁
 $PageLink_(dom).prevPage()
 
 可以取得 this.data 的數質
 $PageLink_(dom).get()
 */
/* ========================================================================== */
/**
 *
 * 包裹器(包裹PageLink)
 */
function $PageLink_(parentDom) {
    // debugger;
    var map = $PageLink_.prototype.init.map;
    var pageLink;

    /* -------------------------------------------- */
    // 取出被閉包的模組
    if (map.has(parentDom) &&
            typeof map.get(parentDom) != 'undefined') {
        pageLink = map.get(parentDom);
    } else {
        pageLink = new $PageLink_.prototype.init(parentDom);
        map.set(parentDom, pageLink);
    }
    /* -------------------------------------------- */
    return pageLink;
}
;
////////////////////////////////////////////////////////////////////////////////

;
(function (_self) {

    function PageLink(parentDom) {

        var self = this;

        /* ----------------------------------------------- */
        /*
         * totalRows => 共有幾筆資料
         * perPageLinks => 分頁連結以多少page為區塊
         * perPageRows => 每個page顯示幾筆資料
         */
        this.option = ['page', 'totalRows', 'perPageLinks', 'perPageRows'];
        /* ----------------------------------------------- */
        this.data = {
            page: null,
            totalRows: null,
            perPageLinks: null,
            perPageRows: null,
            totalPages: null, // 需要計算
            block: null, // 現在在第幾區塊(0開始)
            totalBlocks: null // 共有幾個區塊
        };
        /* ----------------------------------------------- */
        this.linkNodes_array = []; // 存放(dom)
        this.otherLinkNodes_array = []; // 存放(dom)
        /* ----------------------------------------------- */
        // 修改的地方
        this.linkData_array = []; // 存放資料
        this.otherLinkData_array = []; // 指示性符號，非數字
        /* ----------------------------------------------- */
        this.linkClass = ['pageLink', 'n'];
        this.otherLinkClass = ['pageLink', 's'];
        /* ----------------------------------------------- */

        this.parentNode = parentDom || null;
    }
    ;
    ////////////////////////////////////////////////////////////////////////////
    /*
     類別參數
     */
    (function (fn) {

        // 紀錄 dom 與物件的對應
        fn.map = new Map();

    })(PageLink);


    ////////////////////////////////////////////////////////////////////////////
    (function () {
        this._API = function () {};
        /* ================================================================== */
        /*
         設定參數
         _options: {
         page:
         totalRows:
         perPageRows:
         perPageLinks:
         }
         */
        this.set = function (_options) {

            this._setOptions(_options);

            return this;
        };
        /* ================================================================== */
        /*
         繪製 dom
         */
        this.render = function () {

            this._checkOptions();

            /* ------------------------ */
            this._model_1();
            this._model_2();
            this._model_3();
            /* ------------------------ */
            if (this._checkConstructed()) {
                console.log('pageLink edit');
                this._editView();
            } else {
                console.log('pageLink create');
                this._creatView();
            }

            return this;
        };
        /* ================================================================== */
        // 下一頁
        this.nextPage = function () {
            // debugger;

            this.page += 1;
            this.page = this._checkPage(this.page);

            return this;
        };
        /* ================================================================== */
        // 上一頁
        this.prevPage = function () {
            this.page -= 1;
            this.page = this._checkPage(this.page);

            return this;
        };
        /* ================================================================== */
        // 設置頁數
        this.page = function (page) {
            if (typeof page !== 'number' || isNaN(page)) {
                throw new TypeError('page must be number');
            }

            this.page = page;
            this.page = this._checkPage(this.page);

            return this;
        };
        /* ================================================================== */
        // 取得參數
        this.get = function (attribute) {
            var res = undefined;

            if (attribute) {
                if (typeof this.data[attribute] !== 'undefined') {
                    res = this.data[attribute];
                }
            } else {
                res = {};
                for (var k in this.data) {
                    res[k] = this.data[k];
                }
            }

            return res;
        };

    }).call(PageLink.prototype);
    ////////////////////////////////////////////////////////////////////////////
    /**
     * model
     */
    (function () {
        this._model = function () {};

        /* ================================================================== */
        /*
         * 設定參數
         *
         * 最主要的 page(1 開始), block(0 開始)
         *
         * @returns {undefined}
         */
        this._model_1 = function () {
            // debugger;
            var data = this.data;
            /* ------------------------------------------------------ */
            // totalPages
            // 若 totalPages是 0，還是要為 1，這樣才能顯示 dom
            data.totalPages = Math.floor((data.totalRows - 1) / data.perPageRows) + 1;
            data.totalPages = (data.totalPages < 1 ? 1 : data.totalPages);

            // totalBlocks
            // 若 totalPages是 0，還是要為 1，這樣才能顯示 dom
            data.totalBlocks = Math.floor((data.totalPages - 1) / data.perPageLinks) + 1;
            data.totalBlocks = (data.totalBlocks < 1 ? 1 : data.totalBlocks);

            /* ------------------------------------------------------ */
            // page
            data.page = (data.page > data.totalPages) ? data.totalPages : data.page;
            data.page = (data.page < 1) ? 1 : data.page;
            /* ------------------------------------------------------ */

            data.block = Math.floor((data.page - 1) / data.perPageLinks);
        };

        /* ================================================================== */
        /*
         * 建構 下一頁，上一頁的數據
         *
         * @returns {undefined}
         */
        this._model_2 = function () {
            // debugger;
            var self = this;
            var page, data = this.data;

            for (var i = 0; i < 4; i++) {
                var otherObj = {
                    href: 'javascript:;',
                    page: '',
                    text: '',
                    class: this.otherLinkClass.slice(0),
                    show: false
                };
                this.otherLinkData_array.push(otherObj);
            }

            /* ====================================================== */
            // << button
            this.otherLinkData_array[0].text = '<<';

            if (data.block < 1) {
                this.otherLinkData_array[0].show = false;
                this.otherLinkData_array[0].class.push('hide');
            } else {
                this.otherLinkData_array[0].show = true;

                page = data.page - data.perPageLinks;
                page = this._checkPage(page);
                this.otherLinkData_array[0].page = page;
            }
            /* ====================================================== */
            // < button

            this.otherLinkData_array[1].text = '<';

            if (data.page < 2) {
                this.otherLinkData_array[1].show = false;
                this.otherLinkData_array[1].class.push('hide');
            } else {
                this.otherLinkData_array[1].show = true;
                page = (data.page - 1);
                page = this._checkPage(page);
                this.otherLinkData_array[1].page = page;
            }


            /* ====================================================== */
            // > button
            this.otherLinkData_array[2].text = '>';

            if (data.page >= data.totalPages) {
                this.otherLinkData_array[2].show = false;
                this.otherLinkData_array[2].class.push('hide');
            } else {
                this.otherLinkData_array[2].show = true;

                page = (data.page + 1);
                page = this._checkPage(page);
                this.otherLinkData_array[2].page = page;
            }

            /* ====================================================== */
            // >> button
            this.otherLinkData_array[3].text = '>>';

            if (data.block >= data.totalBlocks - 1) {
                this.otherLinkData_array[3].show = false;
                this.otherLinkData_array[3].class.push('hide');
            } else {
                this.otherLinkData_array[3].show = true;
                page = data.page + data.perPageLinks;
                page = this._checkPage(page);
                this.otherLinkData_array[3].page = page;
            }
        };
        /* ================================================================== */
        /*
         * 建構 link 的數據
         *
         * @returns {undefined}
         */
        this._model_3 = function () {
            // debugger;
            var self = this,
                    data = this.data;

            for (var i = 0; i < data.perPageLinks; i++) {
                // debugger;
                var _data = {
                    href: 'javascript:;',
                    page: '',
                    text: '',
                    class: self.linkClass.slice(),
                    show: true,
                    selected: false
                };

                var page = (data.block * data.perPageLinks) + i + 1;

                if (page <= data.totalPages) {
                    // 在 totalPages 以內
                    /* ------------------------ */
                    if (page == data.page) {
                        _data.selected = true;
                        _data.class.push('active');
                    }
                    /* ------------------------ */
                    _data.text = page;
                    _data.page = page;

                } else {
                    // 超過總頁數
                    _data.show = false;
                    _data.text = '.';
                    _data.class.push('hide');
                }
                this.linkData_array.push(_data);
            }
        };
    }).call(PageLink.prototype);

    ////////////////////////////////////////////////////////////////////////////
    (function () {

        this._view = function () {};
        /* ================================================================== */
        /*
         * 建構 html
         *
         * @returns {undefined}
         */
        this._creatView = function () {
            // debugger;

            this.parentNode.innerHTML = '';

            var tmpParent = document.createDocumentFragment();

            /* ------------------------------------------------------ */
            // 建構左邊的兩個按鈕
            for (var i = 0; i < 2; i++) {
                var linkNode = document.createElement('a');

                var _data = this.otherLinkData_array[i];

                linkNode.setAttribute('class', _data.class.join(' '));
                linkNode.setAttribute('href', _data.href);

                linkNode.dataset.page = _data.page;
                linkNode.innerText = _data['text'];

                this.otherLinkNodes_array.push(linkNode);
                tmpParent.appendChild(linkNode);
            }

            /* ============================================================== */
            // 建構 link
            for (var i = 0; i < this.linkData_array.length; i++) {
                var linkNode = document.createElement('a');

                var _data = this.linkData_array[i];

                // 設定(dom)屬性
                linkNode.setAttribute('class', _data.class.join(' '));
                linkNode.setAttribute('href', _data.href);
                linkNode.dataset.page = _data.page;
                linkNode.innerText = _data['text'];


                this.linkNodes_array.push(linkNode);
                tmpParent.appendChild(linkNode);
            }
            /* ============================================================== */
            // 建構右邊的兩個按鈕
            for (var i = 2; i < 4; i++) {
                var linkNode = document.createElement('a');

                var _data = this.otherLinkData_array[i];

                linkNode.setAttribute('class', _data.class.join(' '));
                linkNode.setAttribute('href', _data.href);
                linkNode.dataset.page = _data.page;
                linkNode.innerText = _data['text'];

                this.otherLinkNodes_array.push(linkNode);
                tmpParent.appendChild(linkNode);
            }
            /* ------------------------------------------------------ */
            this.parentNode.appendChild(tmpParent);

            /* ------------------------------------------------------ */
            this.linkData_array = [];
            this.otherLinkData_array = [];
        };
        /* ================================================================== */
        /*
         * 修改既有的(html)結構
         *
         * 從已有的紀錄 this.linkNodes_array，this.otherLinkNodes_array拿出來修改
         *
         * @returns {undefined}
         */
        this._editView = function () {
            // debugger;

            for (var i = 0; i < this.linkNodes_array.length; i++) {
                var linkNode = this.linkNodes_array[i];
                var _data = this.linkData_array[i];

                linkNode.dataset.page = _data.page;
                linkNode.innerText = _data['text'];

                this.setClass(linkNode, _data.class);
            }

            /* -------------------------------------------- */

            for (var i = 0; i < this.otherLinkNodes_array.length; i++) {
                var linkNode = this.otherLinkNodes_array[i];

                var _data = this.otherLinkData_array[i];

                linkNode.dataset.page = _data.page;
                linkNode.innerText = _data['text'];

                this.setClass(linkNode, _data.class);
            }
            this.linkData_array = [];
            this.otherLinkData_array = [];
        };
        /* ================================================================== */
    }).call(PageLink.prototype);
    ////////////////////////////////////////////////////////////////////////////

    (function () {
        /*
         * 檢查輸入的 page，將正確值輸出
         */
        this._checkPage = function (page) {
            var data = this.data;

            if (page < 1) {
                return 1;
            }

            if (page > data.totalPages) {
                return data.totalPages;
            }
            return page;
        };
        /* ================================================================== */
        // 設定參數
        this._setOptions = function (_option) {
            // debugger;

            if (_option !== Object(_option)) {
                throw new Error('options must be {}');
            }

            // 有在 option 內的選項才會被考慮
            // 把 option 的設定放入 data
            for (var k in _option) {
                if (this.option.indexOf(k) >= 0 && typeof _option[k] === 'number') {
                    this.data[k] = _option[k];
                }
            }
        };
        /* ================================================================== */
        this._checkOptions = function (options) {
            // debugger;

            var data = this.data;

            var errorMsg_array = [];

            if (typeof data.page != 'number' || isNaN(data.page)) {
                errorMsg_array.push('page error');
            }

            if (typeof data.perPageRows != 'number') {
                errorMsg_array.push('perPageRows data error');
            }

            if (typeof data.totalRows != 'number') {
                errorMsg_array.push('totalRows data error');
            }

            if (typeof data.perPageLinks != 'number') {
                errorMsg_array.push('perPageLinks data error');
            }

            if (!this.parentNode) {
                errorMsg_array.push('no setting parentNode');
            }

            if (errorMsg_array.length > 0) {
                throw new Error(errorMsg_array.join(' | '));
            }
        };
        /* ================================================================== */
        // 確認 PageLink 是否已經被建立
        this._checkConstructed = function () {
            var select = '.' + this.linkClass[0];

            // 是否有建立過的(dom)
            var linkDomList = this.parentNode.querySelectorAll(select);

            return (linkDomList.length > 0);
        };

    }).call(PageLink.prototype);


    (function () {
        this.setClass = function (dom, classArray) {
            dom.setAttribute('class', null);

            dom.offsetHeight;
            classArray.forEach(function (className) {
                dom.classList.add(className);

            });
        };
    }).call(PageLink.prototype);
    ////////////////////////////////////////////////////////////////////////////

    // 與外連結
    _self.prototype.init = PageLink;

})($PageLink_);
