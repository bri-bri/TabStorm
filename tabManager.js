var TabStorm = function() {
    this.tabCount = 0;
    this.currentWindow = null;
    this.tabs ={};
    this.pauseUntil = 0;

    this.init = function() {
        var that = this;
        chrome.tabs.query({}, that.callbackWrapper('loadTabs'));

        chrome.tabs.onCreated.addListener(that.callbackWrapper('addTab'));
        chrome.tabs.onUpdated.addListener(
            that.callbackWrapper('updateTab')
        );
        chrome.tabs.onActivated.addListener(
            that.callbackWrapper('updateTab')
        );
        chrome.tabs.onReplaced.addListener(
            that.callbackWrapper('replaceTab')
        );
        chrome.tabs.onRemoved.addListener(
            that.callbackWrapper('removeTab')
        );
    };

    this.callbackWrapper = function(fx) {
        var that = this;
        return function(a, b) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
            else {
                if (!b) {
                    that[fx](a);
                }
                else {
                    that[fx](a, b);
                }
            }
        }
    };

    this.addTab = function(tab, date) {
        // Extract key properties from the tab object
        var that = this,
            shouldRender = false,
            new_tab = {};

        if (!date) {
            date = new Date().getTime();
        }
        if (!tab) {
            return;
        }
        new_tab.id = tab.id;
        new_tab.title = tab.title;
        new_tab.url = tab.url;
        new_tab.date = date;
        
        if (!that.tabs.hasOwnProperty(new_tab.id)) {
            if (Object.keys(that.tabs).length >= 12) {
                shouldRender = true;
            }
        }
        that.tabs[new_tab.id] = new_tab;

        if (shouldRender) { that.render(); }
    }

    this.loadTabs = function(tabs) {
        var that = this;
        
        
        if (tabs) {
            for (i in tabs) {
                that.addTab(tabs[i]);
            }
        }
        else {
            that.init();
        }
    }

    // Removes and returns a tab
    this.removeTab = function(tabId) {
        var that = this,
            tab;
        
        for (id in that.tabs) {
            if (tabId == id) {
                return delete that.tabs[id];
            }
        }
        return false;
    }

    this.render = function(tab) {
        var that = this;
        
        if (that.pauseUntil > new Date().getTime()) {
            return;
        }
        // Send message to contentScript on activeTab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(
                    tabs[0].id, 
                    { "display": true, "tabs": that.tabs }
                );
            }
        });
    }

    this.replaceTab = function(new_tab, old_tab) {
        var that = this;
        that.removeTab(old_tab); 
        chrome.tabs.get(
            new_tab,
            function(tab) { 
                that.callbackWrapper(function() { that.addTab(tab); });
            }
        );
    }

    // tab could be a tabs.Tab or activeInfo object, we just need id
    this.updateTab = function(tab) {
        var that = this,
            tab_id;

        if (tab.hasOwnProperty('id')) {
            tab_id = tab.id;
        }
        else if (tab.hasOwnProperty('tabId')) {
            tab_id = tab.tabId;
        }
        else {
            tab_id = tab;
        }

        if (tab_id) {
            that.removeTab(tab_id);
            chrome.tabs.get(tab_id, that.callbackWrapper('addTab'));
        }
    }

    this.updatePause = function(ts) {
        var that = this;
        that.pauseUntil = ts;
    }
}

var manager = new TabStorm();
manager.init();

chrome.browserAction.onClicked.addListener(function(tab) {
    manager.pauseUntil = 0;
    manager.render(tab);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        if ( request.pause ) {
            manager.updatePause(request.pause);
        }
        if ( request.remove ) {
            chrome.tabs.remove(request.tab_id);
        }
        if ( request.refresh ) {
            manager.updateTab(request.tab_id);
        }
    }
);
