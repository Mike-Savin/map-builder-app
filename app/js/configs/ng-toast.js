var ngToast = function(ngToastProvider) {
    ngToastProvider.configure({
        animation: 'slide',
        dismissButton: true,
        timeout: 5000
    });
};