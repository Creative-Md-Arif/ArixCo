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

    // ✅ FIX: এখন list তৈরির জন্য providesTags যোগ করা হলো, যাতে
    // create/update/delete/toggle এর পর এই cache invalidate হয়ে refetch হয়।
    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Product", id: _id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
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
      // ✅ FIX: "Products" (getProducts) এবং "Product" LIST (allProducts) দুটোই invalidate
      invalidatesTags: ["Products", { type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
      // ✅ FIX: আগে কোনো ট্যাগ ইনভ্যালিডেট হতো না, তাই আপডেটের পরও পুরনো ডেটা cache-এ থেকে যেত
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
        "Products",
      ],
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
      // ✅ FIX: এটা ভুলভাবে providesTags ছিল (delete mutation কখনো cache provide করে না,
      // সে শুধু invalidate করে যাতে list গুলো refetch হয়)
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
        "Products",
      ],
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

    toggleFeatured: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}/toggle-featured`,
        method: "PUT",
      }),
      // ✅ FIX: optimistic update দিয়ে instant UI change (refresh ছাড়াই),
      // fail করলে rollback হবে
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productApiSlice.util.updateQueryData(
            "allProducts",
            undefined,
            (draft) => {
              const product = draft.find((p) => p._id === productId);
              if (product) {
                product.isFeatured = !product.isFeatured;
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      // ✅ background-এ সঠিক server state দিয়ে re-sync করার জন্য invalidate ও রাখা হলো
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
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
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useGetNewArrivalsQuery,
  useGetBestSellersQuery,
  useToggleFeaturedMutation,
  useUpdateSalesCountMutation,
  useGetRelatedProductsQuery,
} = productApiSlice;
