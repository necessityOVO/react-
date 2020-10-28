import React from 'react';
import { connect } from 'react-redux'
import { Form, Input, Button, message } from 'antd';

import './login.less'
import { reqLogin } from '../../api/index'
import { reqVerifyToken } from "../../api/index"
import { userInfoAndTokenAction } from '../../redux/action';


//表单布局
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 10, span: 2 },
};

//表单验证规则
const validateRuler = [{ required: true, message: "这是必输项" }, { max: 12, message: "输入超出上限" }, { min: 4, message: "输入不及下限" }, { whitespace: true, message: "are you kidding？" }, { pattern: /^\w+$/, message: '必须是英文、数组或下划线组成' }]

let isLoginDebounce = false   //用于对登陆请求防抖

// 组件类
@connect(
  state => ({     //传入用户登录信息
    isLogin: state.userInfo.isLogin
  }),
  { userInfoAndTokenAction }
)
class Login extends React.Component {
  componentDidMount() {   //自动登陆
    // console.log(this.props);
    const { history, isLogin } = this.props;
    console.log(isLogin);
    isLogin || reqVerifyToken().then((res) => {
      // console.log(res);
      if (!res.status) {
        history.replace("/admin");
      }
    })
  }

  //输入格式正确时提交
  onFinish = async ({ username, password }) => {    
    if (!isLoginDebounce) {
      isLoginDebounce = true;
      const result = await reqLogin(username, password);
      isLoginDebounce = false;
      if (!result.status) {
        // debugger

        localStorage.setItem("userToken", JSON.stringify(result.data.token));  //保存token,和用户信息到localStorage中
        localStorage.setItem("userInfo", JSON.stringify(result.data.user));

        this.props.userInfoAndTokenAction(result.data) //保存user数据到redux

        this.props.history.push("/admin");
      }
    } else {
      message.warn("正在校验身份，请稍等！", 1)
    }
  };

  onFinishFailed = (errorInfo) => { message.error('输入有误，请重新输入', 1); };
  render() {

    return (
      <div className="login">
        <h1>React后台管理系统</h1>
        <article className="loginForm">
          <h2 style={{ marginTop: "20px" }}>LOGIN IN</h2>
          <Form
            requiredMark={false}
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}

          >
            <Form.Item
              className="center"
              label="用户名"
              name="username"
              rules={validateRuler}
            >
              <Input placeholder="请输入用户名" allowClear />
            </Form.Item>

            <Form.Item

              className="center"
              label="密码"
              name="password"
              rules={validateRuler}
            >
              <Input.Password placeholder="请输入密码" allowClear />
            </Form.Item>

            <Form.Item
              className="center"
              {...tailLayout}>
              <Button type="primary" htmlType="submit">
                提交
        </Button>
            </Form.Item>
          </Form>

        </article>

      </div>
    )
  }
};

export default Login