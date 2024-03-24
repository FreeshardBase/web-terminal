export const toastMixin = {
    methods: {
        toastError: function (title, message) {
            this.$bvToast.toast(message, {
                title: title,
                variant: 'danger',
            });
        },
        toastSuccess: function (title, message) {
            this.$bvToast.toast(message, {
                title: title,
                variant: 'success',
            });
        }
    }
}
