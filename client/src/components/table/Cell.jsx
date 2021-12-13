import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import media from "styled-media-query";
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";
import SelectInput from "./input/SelectInput";
import MultiSelectInput from "./input/MultiSelectInput";
import DatePickerInput from "./input/DatePickerInput";
import { MdCancel } from "react-icons/md";

const rates = { name: 2, tel: 4, teacher_id: 3, start_date: 4, days: 3, count: 3 };
const sum = Object.keys(rates).reduce((acc, cur) => acc + rates[cur], 0);
const onlyPCSum = sum - rates.teacher_id;

const CellContainer = styled.th`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.25rem;
  border-right: 1px solid var(--color-lightgray);
  :last-child {
    border: none;
  }
  ${(props) => css`
    flex: ${rates[props.content] / sum} ${rates[props.content] / sum} 0;
    min-width: calc(${rates[props.content] / sum} * (100% - 2.5rem - 4.5rem));
    ${media.lessThan("small")`
      flex: ${rates[props.content] / onlyPCSum} ${rates[props.content] / onlyPCSum} 0;
      min-width: calc(${rates[props.content] / onlyPCSum} * (100% - 2.5rem - 4.5rem));
    `}
  `}
  ${(props) => {
    if (props.content === "teacher_id")
      return css`
        ${media.lessThan("small")`
          display: none;
        `}
      `;
  }}
  position: relative;
  .content {
    display: flex;
    ${(props) => {
      if (props.content === "count")
        return css`
          justify-content: space-around;
        `;
    }}
  }
  .clear-input {
    ${media.lessThan("medium")`
      display: none;
    `}
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

const ClearBtn = styled.button`
  display: flex;
  color: var(--color-lightgray);
  :hover {
    color: var(--color-gray);
  }
  position: absolute;
  ${(props) => {
    switch (props.content) {
      case "start_date":
        return css`
          right: 2.25rem;
        `;
      case "days":
        return css`
          right: 2rem;
        `;
      case "teacher_id":
        return css`
          right: 2rem;
        `;
      case "count":
        return css`
          display: none;
        `;
      default:
        return css`
          right: 0.75rem;
        `;
    }
  }};
`;

const Cell = ({ content, isOnHead, isEditing, studentInfo, setStudentInfo, children }) => {
  const { teachers: teacherList, days: dayList } = useSelector(({ authReducer }) => authReducer);
  const [displayed, setDisplayed] = useState(null);

  const handleInputClear = () => {
    switch (content) {
      case "days":
        setStudentInfo((prevState) => ({ ...prevState, [content]: [] }));
        break;
      case "start_date":
        setStudentInfo((prevState) => ({ ...prevState, [content]: null }));
        break;
      default:
        setStudentInfo((prevState) => ({ ...prevState, [content]: "" }));
        break;
    }
  };

  useEffect(() => {
    if (!isOnHead) {
      switch (content) {
        case "teacher_id":
          setDisplayed(
            studentInfo.teacher_id
              ? teacherList.find((teacher) => teacher.id === studentInfo.teacher_id)?.name
              : "-"
          );
          break;
        case "days":
          setDisplayed(
            studentInfo.days
              ? studentInfo.days
                  .map((dayId) => dayList.find((day) => day.id === dayId)?.name)
                  .join(", ")
              : "-"
          );
          break;
        case "count":
          setDisplayed(studentInfo[content] || 0);
          break;
        case "edit":
          break;
        default:
          setDisplayed(studentInfo[content] || "-");
          break;
      }
    }
  }, [studentInfo]);

  return (
    <CellContainer content={content} isOnHead={isOnHead}>
      {isOnHead ? (
        <Content className="content">{children}</Content>
      ) : !isEditing ? (
        <Content className="content">{displayed}</Content>
      ) : (
        <>
          {(content === "name" || content === "tel") && (
            <TextInput
              content={content}
              inputValue={studentInfo[content] || ""}
              setInputValue={setStudentInfo}
            />
          )}
          {content === "count" && (
            <NumberInput
              content={content}
              inputValue={studentInfo.count}
              setInputValue={setStudentInfo}
            />
          )}
          {content === "start_date" && (
            <DatePickerInput
              content={content}
              inputValue={studentInfo.start_date}
              setInputValue={setStudentInfo}
            />
          )}
          {content === "teacher_id" && (
            <SelectInput
              content={content}
              inputValue={studentInfo.teacher_id || ""}
              setInputValue={setStudentInfo}
              list={teacherList}
            />
          )}
          {content === "days" && (
            <MultiSelectInput
              content={content}
              list={dayList}
              inputValue={studentInfo.days}
              setInputValue={setStudentInfo}
            />
          )}
        </>
      )}
      {!isOnHead &&
        isEditing &&
        content !== "duration" &&
        (content === "days"
          ? studentInfo[content].length > 0 && (
              <ClearBtn className="clear-input" onClick={handleInputClear} content={content}>
                <MdCancel />
              </ClearBtn>
            )
          : !!studentInfo[content] && (
              <ClearBtn className="clear-input" onClick={handleInputClear} content={content}>
                <MdCancel />
              </ClearBtn>
            ))}
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
  studentInfo: PropTypes.exact({
    id: PropTypes.number,
    name: PropTypes.string,
    club_id: PropTypes.number,
    teacher_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tel: PropTypes.string,
    start_date: PropTypes.string,
    count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    days: PropTypes.arrayOf(PropTypes.number),
    num: PropTypes.number,
  }),
  setStudentInfo: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.node]),
};

export default Cell;
