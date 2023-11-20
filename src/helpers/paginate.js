import { reactive } from 'vue';

export function usePagination() {
  const paginate = reactive({
    currentPage: 1,
    perPage:     10,
    total:       0,
    lastPage:    0,
    loading:     false
  });
  return {
    paginate,
    moveByPage(page, hook) {
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
  request.addResponseMiddleware(
    (data, next) => {
      paginate.perPage = data.perPage;
      paginate.total = data.total;
      paginate.lastPage = data.perPage;
      paginate.currentPage = data.currentPage;
      return next(data.data);
    }
  );
  return request;
}
