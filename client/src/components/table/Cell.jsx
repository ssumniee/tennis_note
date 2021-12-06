import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import media from "styled-media-query";
import PlainInput from "./editing/PlainInput";
import SelectInput from "./editing/SelectInput";
import DatePicker from "./editing/DatePicker";

const rates = { num: 1, name: 2, tel: 4, teacher_id: 3, start_date: 4, days: 3, count: 3 };
const sum = Object.keys(rates).reduce((acc, cur) => acc + rates[cur], 0);
const onlyPCSum = sum - (rates.num + rates.teacher_id);

const CellContainer = styled.th`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.25rem;
  border-right: 1px solid var(--color-lightgray);
  ${(props) => css`
    flex: ${rates[props.content] / sum} ${rates[props.content] / sum} 0;
    min-width: calc(${rates[props.content] / sum} * (100% - 4.5rem));
    ${media.lessThan("small")`
      flex: ${rates[props.content] / onlyPCSum} ${rates[props.content] / onlyPCSum} 0;
      min-width: calc(${rates[props.content] / onlyPCSum} * (100% - 4.5rem));
    `}
  `}
  ${(props) => {
    if (props.content === "num")
      return css`
        max-width: 2rem;
        border-left: none;
        ${media.lessThan("small")`
          display: none;
        `}
      `;
    if (props.content === "teacher_id")
      return css`
        ${media.lessThan("small")`
          display: none;
        `}
      `;
  }}
  .content {
    display: flex;
    ${(props) => {
      if (props.content === "num")
        return css`
          padding: 0 0.25rem;
          justify-content: center;
        `;
      if (props.content === "count")
        return css`
          justify-content: space-around;
        `;
    }}
  }
`;

const Content = styled.div`
  text-align: left;
  flex: 1 1 0;
  overflow-wrap: break-word;
  font-family: Interop-Medium;
  padding: 0 0.5rem;
  ${media.lessThan("medium")`
    padding: 0 0.25rem;
  `}
`;

const Cell = ({ content, isOnHead, isEditing, userInfo, setUserInfo, children }) => {
  const { teachers: teacherList, days: dayList } = useSelector(({ tableReducer }) => tableReducer);
  const [displayed, setDisplayed] = useState(null);

  useEffect(() => {
    if (!isOnHead) {
      switch (content) {
        case "tel":
          setDisplayed(userInfo[content] || "-");
          break;
        case "start_date":
          setDisplayed(
            userInfo[content] ? userInfo[content].split("-").join(". ") : setDisplayed("-")
          );
          break;
        case "teacher_id":
          setDisplayed(teacherList.find((teacher) => teacher.id === userInfo.teacher_id).name);
          break;
        case "days":
          setDisplayed(
            userInfo.days.map((dayId) => dayList.find((day) => day.id === dayId).name).join(", ")
          );
          break;
        case "edit":
          break;
        default:
          setDisplayed(userInfo[content] || "-");
          break;
      }
    }
  }, [userInfo]);

  return (
    <CellContainer content={content} isOnHead={isOnHead}>
      {isOnHead || content === "num" ? (
        <Content className="content">{children}</Content>
      ) : !isEditing ? (
        <Content className="content">{displayed}</Content>
      ) : (
        <>
          {(content === "name" || content === "tel" || content === "count") && (
            <PlainInput content={content} value={userInfo[content]} setValue={setUserInfo} />
          )}
          {content === "start_date" && (
            <DatePicker content={content} value={userInfo.start_date} setValue={setUserInfo} />
          )}
          {content === "teacher_id" && (
            <SelectInput
              content={content}
              value={userInfo.teacher_id}
              setValue={setUserInfo}
              list={teacherList}
            />
          )}
          {content === "days" && (
            <SelectInput
              content={content}
              value={userInfo.days}
              setValue={setUserInfo}
              list={dayList}
            />
          )}
        </>
      )}
    </CellContainer>
  );
};

Cell.defalutProps = {
  isOnHead: false,
};

Cell.propTypes = {
  content: PropTypes.string.isRequired,
  isOnHead: PropTypes.bool,
  isEditing: PropTypes.bool,
  userInfo: PropTypes.exact({
    id: PropTypes.number,
    name: PropTypes.string,
    club_id: PropTypes.number,
    teacher_id: PropTypes.number,
    tel: PropTypes.string,
    start_date: PropTypes.string,
    count: PropTypes.number,
    days: PropTypes.arrayOf(PropTypes.number),
    num: PropTypes.number,
  }),
  setUserInfo: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.node]),
};

export default Cell;
