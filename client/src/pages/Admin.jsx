import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import media from "styled-media-query";
import authApi from "../api/auth";
import clubApi from "../api/club";
import { loginAction, logoutAction, getAllClubInfoAction, windowOffAction } from "../store/actions";
import Table from "../components/table/Table";
import TextInput from "../components/input/TextInput";
import CheckboxInput from "../components/input/CheckboxInput";
import TitleArea from "../components/TitleArea";
import ExportBtn from "../components/table/ExportBtn";

const AdminContainer = styled.div`
  width: 100%;
  max-width: 50rem;
  height: 100%;
  margin: 0 auto;
  padding: 2rem;
  ${media.lessThan("medium")`
    padding: 1rem;
  `}
`;

const Title = styled.h1`
  font-size: 1.125rem;
  font-family: Interop-Medium;
  font-weight: normal;
`;

const SubTitle = styled.h2`
  margin: 1.5rem 0 0.75rem;
  font-size: 0.875rem;
  font-family: Interop-Regular;
  font-weight: normal;
  color: var(--color-darkgray);
`;

const InputArea = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: stretch;
  > * {
    margin-right: 1rem;
    :last-child {
      margin-right: 0;
    }
  }
`;

const InputContainer = styled.div`
  max-width: 15rem;
  height: 2rem;
  .input {
    input {
      font-size: 0.875rem;
    }
  }
`;

const Button = styled.button`
  font-size: 0.925rem;
  flex: 0 0 1;
  line-height: 2rem;
  padding: 0 1rem;
  margin-left: 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--color-blue);
  color: var(--color-white);
  text-align: center;
  :hover {
    opacity: 0.8;
  }
  :disabled {
    opacity: 0.4;
  }
`;

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    admins: adminList,
    temps: tempList,
    clubs: clubList,
  } = useSelector(({ clubReducer }) => clubReducer);
  const [clubInfo, setClubInfo] = useState({ username: "", is_admin: false });

  const handleCreateClub = async () => {
    try {
      // 클럽 계정 생성
      await clubApi.addClubInfo({ ...clubInfo });
      // 리덕스 스토어 업데이트
      const res = await clubApi.getAllClubInfo();
      if (res.status === 200) {
        dispatch(getAllClubInfoAction(res.data));
      }
      // 클럽 정보 input state 초기화
      setClubInfo({ username: "", is_admin: false });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const checkValidUser = async () => {
      try {
        const res = await authApi.me();
        if (res.status === 200) {
          dispatch(loginAction(res.data));
        }
      } catch (error) {
        // 토큰 만료의 경우 error.response.status가 403인 경우를 조건으로 -> 로그아웃 후 Signing으로 리디렉션
        // 다만, res.data가 제대로 넘어오지 않은 경우 등의 예외적인 에러에 대해서도 로그아웃 후 리디렉션 시키기 위해 조건문 생략
        dispatch(logoutAction);
        navigate("/", { replace: true });
      }
    };
    checkValidUser();
  }, []);

  useEffect(() => {
    const getAndSetAllClubInfo = async () => {
      try {
        const res = await clubApi.getAllClubInfo();
        if (res.status === 200) {
          dispatch(getAllClubInfoAction(res.data));
        }
      } catch (err) {
        console.error(err);
      }
    };
    getAndSetAllClubInfo();
  }, []);

  useEffect(() => {
    dispatch(windowOffAction);
  }, []);

  return (
    <AdminContainer>
      <TitleArea>
        <Title>계정 추가</Title>
      </TitleArea>
      <InputArea>
        <InputContainer>
          <TextInput
            className="input"
            content="username"
            inputValue={clubInfo.username}
            setInputValue={setClubInfo}
            fontSize={1}
            placeholder="아이디"
          />
        </InputContainer>
        <InputContainer>
          <CheckboxInput
            content="is_admin"
            inputValue={clubInfo.is_admin}
            setInputValue={setClubInfo}
            description="관리자 계정입니다"
          />
        </InputContainer>
        <Button onClick={handleCreateClub} disabled={!clubInfo.username}>
          추가하기
        </Button>
      </InputArea>
      <TitleArea>
        <Title>계정 목록</Title>
        <ExportBtn subject="club" infoList={{ admin: adminList, temp: tempList, club: clubList }} />
      </TitleArea>
      <SubTitle>관리자 계정</SubTitle>
      <Table subject="club" infoList={adminList} />
      <SubTitle>임시 계정</SubTitle>
      <Table subject="club" infoList={tempList} />
      <SubTitle>클럽 계정</SubTitle>
      <Table subject="club" infoList={clubList} />
    </AdminContainer>
  );
};

export default Admin;
