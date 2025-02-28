import React from "react";
import { useSelector } from "react-redux";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import media from "styled-media-query";
import TextInput from "../input/TextInput";
import SelectInput from "../input/SelectInput";

const rates = { name: 1, court_id: 1 };
const sum = Object.keys(rates).reduce((acc, cur) => acc + rates[cur], 0);
const onlyPCSum = sum;

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
  position: relative;
  .content {
    display: flex;
  }
  ${(props) => {
    if (props.content === "court_id")
      return css`
        ${media.lessThan("medium")`
          border: none;
        `}
      `;
  }}
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

const Label = styled.label`
  font-size: 0.75rem;
  top: -0.5rem;
  transform: translateY(-100%);
  position: absolute;
  padding: 0 0.25rem;
  display: flex;
  .required {
    margin: 0 0.125rem;
    color: var(--color-blue);
  }
`;

const TeacherCell = ({
  content,
  isOnHead,
  isOnAdd,
  isEditing,
  tableInfo,
  setTableInfo,
  label,
  children,
}) => {
  const { courts: courtList } = useSelector(({ authReducer }) => authReducer);
  return (
    <CellContainer content={content} isOnHead={isOnHead}>
      {isOnAdd && (
        <Label>
          {label}
          {content === "name" && <div className="required">*</div>}
        </Label>
      )}
      {isOnHead ? (
        <Content className="content">{children}</Content>
      ) : !isEditing && !isOnAdd ? (
        tableInfo[content] && (
          <Content className="content">
            {content === "court_id" && courtList.length
              ? courtList.find((court) => court.id === tableInfo.court_id)?.name
              : tableInfo[content]}
          </Content>
        )
      ) : (
        <>
          {content === "name" && (
            <TextInput
              content={content}
              inputValue={tableInfo.name || ""}
              setInputValue={setTableInfo}
              placeholder="강사 이름"
            />
          )}
          {content === "court_id" && (
            <SelectInput
              content={content}
              inputValue={tableInfo.court_id || ""}
              setInputValue={setTableInfo}
              list={courtList}
              placeholder="사용 코트"
            />
          )}
        </>
      )}
    </CellContainer>
  );
};

TeacherCell.defalutProps = {
  isOnHead: false,
  isOnAdd: false,
};

TeacherCell.propTypes = {
  content: PropTypes.string.isRequired,
  isOnHead: PropTypes.bool,
  isOnAdd: PropTypes.bool,
  isEditing: PropTypes.bool,
  tableInfo: PropTypes.shape({
    id: PropTypes.number,
    num: PropTypes.number,
    name: PropTypes.string,
    club_id: PropTypes.number,
    court_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  setTableInfo: PropTypes.func,
  label: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.node]),
};

export default TeacherCell;
