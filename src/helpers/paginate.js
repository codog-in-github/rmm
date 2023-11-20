import { reactive } from 'vue';

export function usePagination(hook) {
  const paginate = reactive({
    page:     1,
    perPage:  10,
    total:    0,
    lastPage: 0,
    loading:  false
  });
  return {
    paginate,
    moveByPage(page) {
      if (page > 0 && page <= paginate.lastPage) {
        paginate.loading = true;
        hook()
          .then(() => {
            paginate.page = page;
          })
          .finally(() => {
            paginate.loading = false;
          });
      }
    }
  };
}

export function requestWithPagination(request, paginate) {
  request.addRequestMiddleware(
    (request, next) => {
      if(request.data) {
        request.data.page = paginate.page;
        request.data.perPage = paginate.perPage;
      } else {
        request.data = {
          page:    paginate.page,
          perPage: paginate.perPage
        };
      }
      return next(request);
    },
    0
  );
  return request;
}
