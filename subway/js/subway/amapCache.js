window.amapCache = window.amapCache || {};
(function(window, undefined) {
    var enabledLocalstorage = false,
        defaultOption = {},
        cacheFileListName = {},
        cacheDomListName = {},
        cacheFileListObj = {},
        storage;

    //to see if we can use localStorage
    try {
        storage = window.localStorage;
        storage.setItem('TEST', 'TEST');
        storage.getItem('TEST');
        storage.removeItem('TEST');
        window.enabledLocalstorage = true;
    } catch (e) {
        window.enabledLocalstorage = false;
    }

    // clear localStorage that not fetch to the file list from server
    var _clearLocalStorage = function() {
        for (var i = storage.length - 1; i >= 0; i--) {
            var key = storage.key(i);
            var subway_key = key.split("/")[0];
            if(subway_key == 'data'){
                if (!cacheFileListName[key]) {
                    storage.removeItem(key);
                }
            }
        }
    };

    // load the newest file list from server
    var _loadNewestVersion = function(callback) {
        $.get(defaultOption.versionPath, function(data) {
            cacheFileListObj = data;
            window.amapCache.cacheFileListObj = data;
            window.amapCache.newestVersion = data;
            var key;
            for (key in window.amapCache.newestVersion) {
                if (window.amapCache.newestVersion.hasOwnProperty(key)) {
                    var dom_key = key.split('/')[1].split('_')[0];
                    cacheFileListName[key + '_' + window.amapCache.newestVersion[key]] = true;
                    // if(key.split('/')[1].split('_')[1] == 'drw'){
                    //     cacheFileListName[dom_key + '_dom_' + window.amapCache.newestVersion[key]] = true;
                    // }
                }
            }
            _clearLocalStorage();
            callback && callback();
        }, 'json');
    };

    var _init = function(option) {
        if (enabledLocalstorage) {
            defaultOption.versionPath = option.versionPath || 'data/version/version.json';
            _loadNewestVersion(option.complete);
        } else {
            option.complete();
        }
    };
    window.amapCache.init = _init;

    // load data from server or localStorage
    var _loadDataFromServer = function(url, callback, error) {
        // $.get(url, callback);
        $.ajax({
            url: url,
            type: 'get',
            method: 'get',
            dataType: 'json',
            success: callback,
            error: error
        });
    };
    
    var _loadData = function(filePath, callback, error) {
        var fileMD5 = cacheFileListObj[filePath];
        if (enabledLocalstorage) {
            var storageKey = filePath + '_' + cacheFileListObj[filePath];
            var subwayData = storage.getItem(storageKey);
            if (subwayData) {
                if(Object.prototype.toString.call(subwayData) == '[object String]'){
                    callback(JSON.parse(subwayData));
                } else {
                    callback(subwayData);
                }
            } else {
                _loadDataFromServer(filePath, function(data) {
                    if(Object.prototype.toString.call(data) == '[object String]'){
                        data = JSON.parse(data);
                    }
                    storage.setItem(storageKey, JSON.stringify(data));
                    callback(data);
                }, error);
            }
        } else {
            _loadDataFromServer(filePath, function(data) {
                if(Object.prototype.toString.call(data) == '[object String]'){
                    data = JSON.parse(data);
                }
                callback(data);
            }, error);
        }
    };
    window.amapCache.loadData = _loadData;
    window.amapCache.cacheFileListObj = cacheFileListObj;
    window.amapCache.enabledLocalstorage = enabledLocalstorage;
}(window));