import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decodeCheckoutToken } from "@shared/utils/checkoutToken";
import { LogoLoader } from "@shared/components/atoms/logo-loader";

export default function ShortLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const payload = decodeCheckoutToken(token);

    if (!payload) {
      navigate("/", { replace: true });
      return;
    }

    const params = new URLSearchParams({
      office: payload.office,
      product: payload.product,
      ref: payload.ref,
    });

    navigate(`/checkout?${params.toString()}`, { replace: true });
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <LogoLoader />
    </div>
  );
}
