import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router";
import { api } from "../lib/axios";
import { useAuthStore, type IUser } from "../store/authStore";

const { Title } = Typography;

interface AuthRequest {
  login: string;
  password: string;
}

const LoginPage = () => {
  const { mutate } = useMutation<IUser, string, AuthRequest>({
    mutationFn: (values) => api.post("/auth/login", values),
  });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: AuthRequest) => {
    mutate(values, {
      onSuccess(data) {
        setAuth(data);
        navigate("/");
      },
      onError(error) {
        message.error(error);
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-2 text-center">
          <Title level={2} style={{ marginBottom: 0 }}>
            Kirish
          </Title>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item name="login" rules={[{ required: true, message: "Пожалуйста, введите ваш логин!" }]}>
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Login"
              className="rounded-md mb-1"
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Пожалуйста, введите ваш пароль!" }]}>
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="••••••••"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold transition-all"
            >
              Yuborish
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
