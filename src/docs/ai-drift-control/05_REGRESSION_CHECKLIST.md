# Regression Checklist (run BEFORE finishing every task)

Mark each item. If any fails, fix before reporting done.

- [ ] Routes still work (existing routes load; new route imported + added in App.jsx)
- [ ] Forms still validate
- [ ] Buttons / actions still work (every interaction wired end-to-end)
- [ ] Required fields still block submit
- [ ] Permissions still work (user vs admin)
- [ ] Admin areas remain protected (AdminRoute + backend role checks)
- [ ] Private data remains private (ProtectedRoute, RLS, signed URLs)
- [ ] Mobile layout works
- [ ] Desktop layout works
- [ ] Existing user-facing copy is unchanged
- [ ] Existing records still load (no breaking entity/field changes)
- [ ] No duplicate feature/component/page/entity/function was created
- [ ] Design system respected (tokens, fonts, AI image aesthetic)
- [ ] New public pages: GA4 tracking + SEO pass completed