import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Rihla Access SignIn Dashboard"
        description="This is Admin SignIn Dashboard page for Rihla Access"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
