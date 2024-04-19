export const toastMixin = {
    methods: {

        toastError: function (title, message) {
            if (message === undefined) {
                this.$bvToast.toast(title, {
                    variant: 'danger',
                    noCloseButton: true,
                });
            } else {
                this.$bvToast.toast(message, {
                    title: title,
                    variant: 'danger',
                });
            }
        },

        toastSuccess: function (title, message) {
            if (message === undefined) {
                this.$bvToast.toast(title, {
                    variant: 'success',
                    noCloseButton: true,
                });
            } else {
                this.$bvToast.toast(message, {
                    title: title,
                    variant: 'success',
                });
            }
        }

    }
}
