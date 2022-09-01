import React, { useState } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

const Rating = ({
  size,
  icon,
  scale,
  fillColor,
  strokeColor,
  w,
  h,
  content,
  updateRating,
}) => {
  const [rating, setRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const buttons = [];

  const onClick = async (idx) => {
    const data = {
      givenRating: idx,
      ratedEmail: content.email,
    };

    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      if (!isNaN(idx)) {
        setRating(idx);
        updateRating();
      }
    } else {
      setErrorMessage((await response.json()).error);
    }
  };

  const RatingIcon = ({ fill }) => {
    return (
      <StarIcon
        name={icon}
        size={`${size}px`}
        w={`${w}px`}
        h={`${h}px`}
        color={fillColor}
        stroke={strokeColor}
        fillOpacity={fill ? "100%" : "0"}
      />
    );
  };

  const RatingButton = ({ idx, fill }) => {
    return (
      <Box
        as="button"
        aria-label={`Rate ${idx}`}
        height={`${size}px`}
        width={`${size}px`}
        variant="unstyled"
        mx={1}
        onClick={() => onClick(idx)}
        _focus={{ outline: 0 }}
      >
        <RatingIcon fill={fill} />
      </Box>
    );
  };

  for (let i = 1; i <= scale; i++) {
    buttons.push(<RatingButton key={i} idx={i} fill={i <= rating} />);
  }

  return (
    <div>
      <Stack isInline mt={8} justify="left">
        <input name="rating" type="hidden" value={rating} />
        {buttons}
        <Box width={`${size * 3}px`} textAlign="center">
          <Text fontSize="sm" textTransform="uppercase">
            Din vurdering av {content.displayName}:
          </Text>
          <Text fontSize="2xl" fontWeight="semibold" lineHeight="1.2em">
            {rating}
          </Text>
        </Box>
      </Stack>

      <Text>{errorMessage}</Text>
    </div>
  );
};

Rating.displayName = "Rating";

export default Rating;
