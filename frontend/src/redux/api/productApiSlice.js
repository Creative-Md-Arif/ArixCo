import { PRODUCT_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        keyword = "",
        page = 1,
        sort = "newest",
        minPrice,
        maxPrice,
        category,
      }) => ({
        url: `${PRODUCT_URL}`,
        params: {
          keyword,
          page,
          sort,
          ...(minPrice !== undefined && minPrice !== 0 && { minPrice }),
          ...(maxPrice !== undefined && maxPrice !== 100000 && { maxPrice }),
          ...(category && { category }),
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`,
    }),

    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: (formData) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: formData,
        formData: true,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      providesTags: ["Product"],
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`,
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`,
      keepUnusedDataFor: 5,
    }),

    getNewArrivals: builder.query({
      query: (limit = 8) => `${PRODUCT_URL}/new-arrivals?limit=${limit}`,
      keepUnusedDataFor: 5,
      providesTags: ["NewArrivals"],
    }),

    getBestSellers: builder.query({
      query: (limit = 8) => `${PRODUCT_URL}/best-sellers?limit=${limit}`,
      keepUnusedDataFor: 5,
      providesTags: ["BestSellers"],
    }),

    updateSalesCount: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/update-sales`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BestSellers"],
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: "POST",
        body: { checked, radio },
      }),
    }),

    getRelatedProducts: builder.query({
      query: ({ productId, limit = 4 }) => ({
        url: `${PRODUCT_URL}/related/${productId}?limit=${limit}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, { productId }) => [
        { type: "RelatedProducts", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useGetNewArrivalsQuery,
  useGetBestSellersQuery,
  useUpdateSalesCountMutation,
  useGetRelatedProductsQuery,
} = productApiSlice;
