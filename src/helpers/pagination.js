import { reactive } from 'vue';

export function usePagination() {
  const paginate = reactive({
    currentPage: 1,
    perPage:     10,
    total:       0,
    lastPage:    0,
    loading:     false
  });
  function callHook(hook) {
    if (!hook) {
      return;
    }
    hook();
  }
  return {
    paginate,
    reset(hook) {
      paginate.currentPage = 1;
      callHook(hook);
    },
    changeSize(size, hook) {
      paginate.perPage = size;
      paginate.currentPage = 1;
      callHook(hook);
    },
    moveByPage(page, hook) {
      if (page > 0 && page <= paginate.lastPage) {
        callHook(hook);
      }
    },
    requestMiddleware(request, next) {
      paginate.loading = true;
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
    responseMiddleware(response, next) {
      paginate.loading = false;
      if (response) {
        paginate.perPage = response.perPage;
        paginate.total = response.total;
        paginate.lastPage = response.perPage;
        paginate.currentPage = response.currentPage;
      }
      return next(response.data);
    }
  };
}

export function requestWithPagination(request, pagination) {
  return request
    .addRequestMiddleware(
      pagination.requestMiddleware, 0
    )
    .addResponseMiddleware(
      pagination.responseMiddleware
    );
}
