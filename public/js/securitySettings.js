function deleteAccountNotification() {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover your account!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            var form = document.createElement('form');
            document.body.appendChild(form);
            form.method = 'post';
            form.action = '/user/settings/security/DeleteAccount';
            form.submit();
        } else {
          swal("Account has not been deleted");
        }
      });
}
