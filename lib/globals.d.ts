export type Pages = import('hexo').Locals.Page & {
  redirect_from: string[];
  redirect_to: string;
};
export type Posts = import('hexo').Locals.Post & {
  redirect_from: string[];
  redirect_to: string;
};
